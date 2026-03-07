use anchor_lang::prelude::*;

// ==================== Counter Account ====================

#[account]
pub struct Counter {
    pub value: u64,
    pub authority: Pubkey,
}

// ==================== Counter Contexts ====================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 32,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Reset<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

// ==================== Counter Instructions ====================

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.value = 0;
    counter.authority = ctx.accounts.user.key();
    msg!("Counter initialized with value: {}", counter.value);
    Ok(())
}

pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.value += 1;
    msg!("Counter incremented to: {}", counter.value);
    Ok(())
}

pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    require!(counter.value > 0, CounterError::UnderflowError);
    counter.value -= 1;
    msg!("Counter decremented to: {}", counter.value);
    Ok(())
}

pub fn reset(ctx: Context<Reset>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.value = 0;
    msg!("Counter reset to: {}", counter.value);
    Ok(())
}

// ==================== Counter Errors ====================

#[error_code]
pub enum CounterError {
    #[msg("Cannot decrement below zero")]
    UnderflowError,
}
