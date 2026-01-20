import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { accountRepository, userRepository } from "@/lib/db/repositories";
import AccountApi from "@/lib/db/models/AccountApi";
import { validateAdminRequest } from "@/lib/auth";
import { AccountStatusType } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const result = await accountRepository.list({
      page,
      limit,
      filters: {
        search: search || undefined,
        status: (status as AccountStatusType) || undefined,
      },
    });

    return NextResponse.json({
      accounts: result.data,
      pagination: result.pagination,
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

    // Check if account name already exists
    if (body.accountName) {
      const nameExists = await accountRepository.nameExists(body.accountName);
      if (nameExists) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con este nombre" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    if (body.user?.email) {
      const emailExists = await userRepository.findByEmail(body.user.email);
      if (emailExists) {
        return NextResponse.json(
          { error: "Ya existe un usuario con este email" },
          { status: 400 }
        );
      }
    }

    // Create new user with provided data
    const user = await userRepository.createUser({
      email: body.user.email,
      password: body.user.password,
      firstName: body.user.firstName,
      lastName: body.user.lastName,
      phone: body.user.phone,
      phoneCountryCode: body.user.phoneCountryCode,
    });

    // Create account with user as owner
    const account = await accountRepository.create({
      name: body.accountName,
      type: body.type,
      status: body.status || "ACTIVE",
      billing: body.billing || {},
      serviceConfig: {
        apiEnabled: body.apiEnabled !== undefined ? body.apiEnabled : true,
        webhookEnabled: body.webhookEnabled || false,
        maxRequestsPerDay: body.maxRequestsPerDay ?? null,
        maxRequestsPerMonth: body.maxRequestsPerMonth ?? null,
      },
      users: [{ user: user._id, role: "OWNER", addedAt: new Date() }],
      createdBy: admin._id,
    });

    // Add account to user's accounts list
    await userRepository.addAccount(user._id, account._id);

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

    // Get account with populated user info
    const populatedAccount = await accountRepository.findWithUsers(account._id);

    return NextResponse.json(
      { account: populatedAccount, accountApi, user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
