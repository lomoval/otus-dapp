use anchor_lang::prelude::*;
use anchor_lang::system_program;

// ==================== Subscription Account ====================

#[account]
pub struct Subscription {
    pub owner: Pubkey,
    pub service_provider: Pubkey,
    pub amount: u64,
    pub duration: i64,
    pub start_time: i64,
    pub is_active: bool,
    pub bump: u8,
}

impl Subscription {
    pub const SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1; // 98 bytes
}

// ==================== Subscription Contexts ====================

#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    #[account(
        init,
        payer = owner,
        space = Subscription::SIZE,
        seeds = [b"subscription", owner.key().as_ref(), service_provider.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Service provider - any valid address
    pub service_provider: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PaySubscription<'info> {
    #[account(
        mut,
        seeds = [b"subscription", owner.key().as_ref(), service_provider.key().as_ref()],
        bump = subscription.bump,
        has_one = owner,
        has_one = service_provider
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Payment recipient
    #[account(mut)]
    pub service_provider: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(
        mut,
        seeds = [b"subscription", owner.key().as_ref(), service_provider.key().as_ref()],
        bump = subscription.bump,
        has_one = owner
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Service provider for PDA seed
    pub service_provider: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CloseSubscription<'info> {
    #[account(
        mut,
        seeds = [b"subscription", owner.key().as_ref(), service_provider.key().as_ref()],
        bump = subscription.bump,
        has_one = owner,
        close = owner
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Service provider for PDA seed
    pub service_provider: AccountInfo<'info>,
}

// ==================== Subscription Instructions ====================

pub fn create_subscription(
    ctx: Context<CreateSubscription>,
    amount: u64,
    duration: i64,
) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    let clock = Clock::get()?;

    subscription.owner = ctx.accounts.owner.key();
    subscription.service_provider = ctx.accounts.service_provider.key();
    subscription.amount = amount;
    subscription.duration = duration;
    subscription.start_time = clock.unix_timestamp;
    subscription.is_active = true;
    subscription.bump = ctx.bumps.subscription;

    msg!(
        "Subscription created: owner={}, provider={}, amount={} lamports, duration={} sec",
        subscription.owner,
        subscription.service_provider,
        subscription.amount,
        subscription.duration
    );
    Ok(())
}

pub fn pay_subscription(ctx: Context<PaySubscription>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;

    require!(subscription.is_active, SubscriptionError::SubscriptionNotActive);

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.service_provider.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, subscription.amount)?;

    let clock = Clock::get()?;
    subscription.start_time = clock.unix_timestamp;

    msg!(
        "Payment of {} lamports transferred to {}",
        subscription.amount,
        subscription.service_provider
    );
    Ok(())
}

pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;

    require!(subscription.is_active, SubscriptionError::SubscriptionNotActive);

    subscription.is_active = false;

    msg!("Subscription cancelled for: {}", subscription.owner);
    Ok(())
}

pub fn close_subscription(ctx: Context<CloseSubscription>) -> Result<()> {
    msg!("Subscription closed, rent returned to: {}", ctx.accounts.owner.key());
    Ok(())
}

// ==================== Subscription Errors ====================

#[error_code]
pub enum SubscriptionError {
    #[msg("Subscription is not active")]
    SubscriptionNotActive,
    #[msg("Subscription has expired")]
    SubscriptionExpired,
    #[msg("Insufficient payment amount")]
    InsufficientPayment,
}
