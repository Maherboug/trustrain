module TrusTrain::AddrDeploy {
    
use std::signer;
    use aptos_framework::coin;
    use aptos_framework::coin::CoinStore;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::option::Option;
    use std::vector::{Self as Vector, empty, push_back};

    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const E_RESOURCE_NOT_ENOUGH: u64 = 2;

    struct ResourceProvider has key, store {
        address: address,
        cpu: u64,
        gpu: u64,
        is_external: bool,
    }

    struct Allocation has key {
        cpu: u64,
        gpu: u64,
        model_trainer: address,
        resource_provider: address,
        allocation_time: u64,
        payment_amount: u64,
    }

    // New struct to hold a list of ResourceProviders
    struct ResourceProviders has key {
        providers: vector<ResourceProvider>,
    }

    public fun register_resources(
        account: &signer,
        cpu: u64,
        gpu: u64,
        is_external: bool,
    )  acquires ResourceProviders{
        let provider = ResourceProvider {
            address: signer::address_of(account),
            cpu: cpu,
            gpu: gpu,
            is_external: is_external,
        };
        // Add the new provider to the list of providers
        let providers = borrow_global_mut<ResourceProviders>(signer::address_of(account));
        push_back(&mut providers.providers, provider);
    }

    // Initialize the ResourceProviders resource for an account
    public fun initialize_providers(account: &signer) {
        let providers = ResourceProviders {
            providers: empty(),
        };
        move_to(account, providers);
    }
    public fun allocate_resource(
        account: &signer,
        provider_address: address,
        cpu: u64,
        gpu: u64,
        allocation_time: u64,
        payment_amount: u64,
    ) acquires ResourceProvider {
        let provider = borrow_global_mut<ResourceProvider>(provider_address);
        // Check if the provider has enough resources
        assert!(provider.cpu >= cpu && provider.gpu >= gpu, E_RESOURCE_NOT_ENOUGH);

        // Subtract the allocated resources
        provider.cpu = provider.cpu - cpu;
        provider.gpu = provider.gpu - gpu;

        let allocation = Allocation {
            cpu: cpu,
            gpu: gpu,
            model_trainer: signer::address_of(account),
            resource_provider: provider_address,
            allocation_time: allocation_time,
            payment_amount: payment_amount,
        };
        move_to(account, allocation);
    }

    public fun pay_resource_provider(
        payer: &signer,
        provider_address: address,
        payment_amount: u64,
    )  {
        // Transfer the payment amount from the payer's account to the resource provider
        coin::transfer<AptosCoin>(payer, provider_address, payment_amount);
    }

}