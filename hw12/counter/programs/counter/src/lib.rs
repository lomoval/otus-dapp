use anchor_lang::prelude::*;

mod counter_impl;
mod subscription_impl;

#[allow(ambiguous_glob_reexports)]
pub use counter_impl::*;
#[allow(ambiguous_glob_reexports)]
pub use subscription_impl::*;

declare_id!("E4h5ZWMi7jUgSucoXRMi4LBM7mivWHqFQEbj6sTMiiZm");

#[program]
pub mod counter {
    use super::*;

    // ==================== Counter Instructions ====================

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        crate::counter_impl::initialize(ctx)
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        crate::counter_impl::increment(ctx)
    }

    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        crate::counter_impl::decrement(ctx)
    }

    pub fn reset(ctx: Context<Reset>) -> Result<()> {
        crate::counter_impl::reset(ctx)
    }

    // ==================== Subscription Instructions ====================

    pub fn create_subscription(
        ctx: Context<CreateSubscription>,
        amount: u64,
        duration: i64,
    ) -> Result<()> {
        crate::subscription_impl::create_subscription(ctx, amount, duration)
    }

    pub fn pay_subscription(ctx: Context<PaySubscription>) -> Result<()> {
        crate::subscription_impl::pay_subscription(ctx)
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        crate::subscription_impl::cancel_subscription(ctx)
    }

    pub fn close_subscription(ctx: Context<CloseSubscription>) -> Result<()> {
        crate::subscription_impl::close_subscription(ctx)
    }
}
