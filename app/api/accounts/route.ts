import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db/connection";
import Account from "@/lib/db/models/Account";
import AccountApi from "@/lib/db/models/AccountApi";
import User from "@/lib/db/models/User";
import { validateAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { uid: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "billing.name": { $regex: search, $options: "i" } },
        { "billing.taxId": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const [accounts, total] = await Promise.all([
      Account.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "users.user",
          select: "firstName lastName phone phoneCountryCode email -_id",
        })
        .select("-__v")
        .lean(),
      Account.countDocuments(query),
    ]);

    return NextResponse.json({
      accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get accounts error:", error);
    return NextResponse.json(
      { error: "Error al obtener cuentas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await validateAdminRequest(request);
    if (error || !admin) {
      return NextResponse.json(
        { error: error || "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    await dbConnect();

    // Check if email already exists
    const existingAccount = await Account.findOne({
      email: body.email.toLowerCase(),
      deletedAt: null,
    });
    if (existingAccount) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (body.phone) {
      const existingPhone = await Account.findOne({
        phone: body.phone,
        deletedAt: null,
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con este telefono" },
          { status: 400 }
        );
      }
    }

    // Find or create user as Owner
    let user = await User.findOne({
      email: body.email.toLowerCase(),
      deletedAt: null,
    });

    if (!user) {
      // Create new user with billing name or email prefix as name
      const nameFromBilling = body.billing?.name || "";
      const nameParts = nameFromBilling.split(" ");
      const firstName = nameParts[0] || body.email.split("@")[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      user = new User({
        email: body.email.toLowerCase(),
        firstName,
        lastName,
        phone: body.phone,
        authMethod: "LOCAL",
      });
      await user.save();
    }

    // Create account with user as owner
    const account = new Account({
      name: body.name,
      type: body.type,
      email: body.email,
      phone: body.phone,
      status: body.status || "PENDING",
      billing: body.billing || {},
      maxRequestsPerDay: body.maxRequestsPerDay ?? null,
      maxRequestsPerMonth: body.maxRequestsPerMonth ?? null,
      webhookEnabled: body.webhookEnabled || false,
      apiEnabled: body.apiEnabled !== undefined ? body.apiEnabled : true,
      users: [{ user: user._id, role: "OWNER", addedAt: new Date() }],
    });

    await account.save();

    // Get next id for AccountApi
    const lastAccountApi = await AccountApi.findOne()
      .sort({ id: -1 })
      .select("id");
    const nextId = (lastAccountApi?.id || 0) + 1;

    // Generate API key
    const apiKey = `fd_${crypto.randomBytes(32).toString("hex")}`;

    // Create AccountApi document
    const accountApi = new AccountApi({
      id: nextId,
      accountId: account._id,
      apiKey,
      isEnabled: body.apiEnabled !== undefined ? body.apiEnabled : true,
      webhooks: [],
      createdBy: admin._id,
    });

    await accountApi.save();

    // Populate the account with user info before returning
    await account.populate({
      path: "users.user",
      select: "uid firstName lastName email phone",
    });

    return NextResponse.json({ account, accountApi, user }, { status: 201 });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
