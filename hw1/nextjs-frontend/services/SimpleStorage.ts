import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SimpleStorageConfig = {
    id: number;
    counter: number;
    data: string;
};

export function simpleStorageConfigToCell(config: SimpleStorageConfig): Cell {
    return beginCell()
        .storeUint(config.id, 32)
        .storeUint(config.counter, 32)
        .storeRef(beginCell().storeStringTail(config.data).endCell())
        .endCell();
}

export const Opcodes = {
    update: 0x00957974,
};

export class SimpleStorage implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new SimpleStorage(address);
    }

    static createFromConfig(config: SimpleStorageConfig, code: Cell, workchain = 0) {
        const data = simpleStorageConfigToCell(config);
        const init = { code, data };
        return new SimpleStorage(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendUpdate(
        provider: ContractProvider,
        via: Sender,
        opts: {
            data: string;
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.update, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeRef(beginCell().storeStringTail(opts.data).endCell())
                .endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }

    async getData(provider: ContractProvider) {
        const result = await provider.get('get_stored_data', []);
        const dataCell = result.stack.readCell();
        const dataSlice = dataCell.beginParse();
        return dataSlice.loadStringTail();
    }
}
