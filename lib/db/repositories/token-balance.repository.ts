import { Types } from 'mongoose'
import { BaseRepository } from './base.repository'
import AccountTokenBalance, { IAccountTokenBalance } from '../models/AccountTokenBalance'
import Movement, { IMovement } from '../models/Movement'
import { MovementType, MovementStatus } from '@/lib/constants/movement.constants'
import { ExtendedModel } from '@/lib/db/types/model.types'
import dbConnect from '../connection'

export interface AddTokensResult {
  balance: IAccountTokenBalance
  movement: IMovement
}

class TokenBalanceRepository extends BaseRepository<IAccountTokenBalance> {
  constructor() {
    super(AccountTokenBalance as ExtendedModel<IAccountTokenBalance>)
  }

  /**
   * Get token balance by account ID
   */
  async getByAccountId(accountId: string | Types.ObjectId): Promise<IAccountTokenBalance | null> {
    await this.ensureConnection()
    return this.model.findOne({
      accountId: new Types.ObjectId(accountId),
      deletedAt: null
    })
  }

  /**
   * Get or create token balance for an account
   */
  async getOrCreateBalance(accountId: string | Types.ObjectId): Promise<IAccountTokenBalance> {
    await this.ensureConnection()

    const objectId = new Types.ObjectId(accountId)
    let balance = await this.model.findOne({
      accountId: objectId,
      deletedAt: null
    })

    if (!balance) {
      const nextId = await this.getNextId()
      balance = await this.model.create({
        id: nextId,
        accountId: objectId,
        totalAvailable: 0,
        totalPurchased: 0,
        totalBonus: 0,
        totalConsumed: 0,
        totalRefunded: 0,
        consumptionByService: {}
      })
    }

    return balance
  }

  /**
   * Add bonus tokens to an account (gift tokens)
   * Updates the balance and creates a movement record
   */
  async addBonusTokens(
    accountId: string | Types.ObjectId,
    amount: number,
    description: string,
    createdBy?: Types.ObjectId
  ): Promise<AddTokensResult> {
    await dbConnect()

    const objectId = new Types.ObjectId(accountId)

    // Get or create balance
    const balance = await this.getOrCreateBalance(objectId)

    // Update balance atomically
    const updatedBalance = await this.model.findOneAndUpdate(
      { _id: balance._id },
      {
        $inc: {
          totalAvailable: amount,
          totalBonus: amount
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    if (!updatedBalance) {
      throw new Error('Error al actualizar el balance de tokens')
    }

    // Get next movement ID
    const lastMovement = await Movement.findOne().sort({ id: -1 }).select('id').lean()
    const nextMovementId = ((lastMovement as { id?: number })?.id || 0) + 1

    // Create movement record
    const movement = await Movement.create({
      id: nextMovementId,
      type: MovementType.TOKENS_BONUS,
      status: MovementStatus.APPROVED,
      accountId: objectId,
      searches: [],
      expirationAt: null,
      metadata: {
        tokenAmount: amount,
        description
      },
      createdBy,
      createdAt: new Date()
    })

    return {
      balance: updatedBalance,
      movement
    }
  }

  /**
   * Adjust token balance manually (can be positive or negative)
   */
  async adjustBalance(
    accountId: string | Types.ObjectId,
    amount: number,
    description: string,
    createdBy?: Types.ObjectId
  ): Promise<AddTokensResult> {
    await dbConnect()

    const objectId = new Types.ObjectId(accountId)
    const balance = await this.getOrCreateBalance(objectId)

    // Check if negative adjustment would result in negative balance
    if (amount < 0 && balance.totalAvailable + amount < 0) {
      throw new Error('El ajuste resultaría en un balance negativo')
    }

    // Update balance atomically
    const updatedBalance = await this.model.findOneAndUpdate(
      { _id: balance._id },
      {
        $inc: {
          totalAvailable: amount
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    if (!updatedBalance) {
      throw new Error('Error al actualizar el balance de tokens')
    }

    // Get next movement ID
    const lastMovement = await Movement.findOne().sort({ id: -1 }).select('id').lean()
    const nextMovementId = ((lastMovement as { id?: number })?.id || 0) + 1

    // Create movement record
    const movement = await Movement.create({
      id: nextMovementId,
      type: MovementType.TOKENS_ADJUSTMENT,
      status: MovementStatus.APPROVED,
      accountId: objectId,
      searches: [],
      expirationAt: null,
      metadata: {
        tokenAmount: amount,
        description
      },
      createdBy,
      createdAt: new Date()
    })

    return {
      balance: updatedBalance,
      movement
    }
  }
}

export const tokenBalanceRepository = new TokenBalanceRepository()
