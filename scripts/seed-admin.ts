import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fulldata'

const AdminSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'SUPER_ADMIN' },
    status: { type: String, default: 'ACTIVE' },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'admins', timestamps: true }
)

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@fulldata.pro' })
    if (existingAdmin) {
      console.log('Admin already exists')
      process.exit(0)
    }

    // Create admin
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    const admin = new Admin({
      uid: `adm_${new mongoose.Types.ObjectId().toString()}`,
      name: 'Super Admin',
      email: 'admin@fulldata.pro',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    })

    await admin.save()
    console.log('Admin created successfully!')
    console.log('Email: admin@fulldata.pro')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error seeding admin:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seedAdmin()
