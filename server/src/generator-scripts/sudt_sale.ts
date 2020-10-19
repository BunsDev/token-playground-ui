import { addCellDep, isAcpScript } from "./helper";
import {
  utils,
  Hash,
  Address,
  Cell,
  Script,
  Header,
  CellCollector as CellCollectorInterface,
  values,
} from "@ckb-lumos/base";
const { toBigUInt128LE, readBigUInt128LE, computeScriptHash } = utils;
import secp256k1Blake160Multisig from "./secp256k1_blake160_multisig";
import { FromInfo, parseFromInfo } from "./from_info";
import common from "./common";
import {
  parseAddress,
  minimalCellCapacity,
  TransactionSkeletonType,
  Options,
} from "@ckb-lumos/helpers";
import { Set, List } from "immutable";
import { getConfig, Config } from "@ckb-lumos/config-manager";
import { CellCollector as LocktimeCellCollector } from "./locktime_pool";
import anyoneCanPay, {
  CellCollector as AnyoneCanPayCellCollector,
} from "./anyone_can_pay";
const { ScriptValue } = values;
import secp256k1Blake160 from "./secp256k1_blake160";

export type Token = Hash;

/**
 * Issue an sUDT cell
 *
 * @param txSkeleton
 * @param fromInfo
 * @param amount
 * @param capacity
 * @param tipHeader
 * @param options
 */
export async function createTokenSale(
  txSkeleton: TransactionSkeletonType,
  fromInfo: FromInfo,
  udtHash, 
  ckbAmount: bigint, 
  udtAmount: bigint, 
  price: bigint,
  capacity?: bigint,
  tipHeader?: Header,
  { config = undefined }: Options = {}
): Promise<TransactionSkeletonType> {
  config = config || getConfig();

  const template = config.SCRIPTS.SUDT;
  const saleTemplate = config.SCRIPTS.SUDT_SALE;

  if (!template) {
    throw new Error("Provided config does not have SUDT script setup!");
  }

  txSkeleton = addCellDep(txSkeleton, {
    out_point: {
      tx_hash: template.TX_HASH,
      index: template.INDEX,
    },
    dep_type: template.DEP_TYPE,
  });

  // txSkeleton = addCellDep(txSkeleton, {
  //   out_point: {
  //     tx_hash: saleTemplate.TX_HASH,
  //     index: saleTemplate.INDEX,
  //   },
  //   dep_type: saleTemplate.DEP_TYPE,
  // });

  // const fromScript = parseFromInfo(fromInfo, { config }).fromScript;
  // const sudtSaleScript = "";

  // const sudtTypeScript = {
  //   code_hash: template.CODE_HASH,
  //   hash_type: template.HASH_TYPE,
  //   args: computeScriptHash(fromScript),
  // };

  // const targetOutput: Cell = {
  //   cell_output: {
  //     capacity: "0x0",
  //     lock: sudtSaleScript,
  //     type: sudtTypeScript,
  //   },
  //   data: toBigUInt128LE(udtAmount),
  //   out_point: undefined,
  //   block_hash: undefined,
  // };

  // if (!capacity) {
  //   capacity = minimalCellCapacity(targetOutput);
  // }
  // capacity = BigInt(capacity);
  // targetOutput.cell_output.capacity = "0x" + capacity.toString(16);

  // txSkeleton = txSkeleton.update("outputs", (outputs) => {
  //   return outputs.push(targetOutput);
  // });

  // const outputIndex = txSkeleton.get("outputs").size - 1;

  // // fix entry
  // txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
  //   return fixedEntries.push({
  //     field: "outputs",
  //     index: outputIndex,
  //   });
  // });

  // txSkeleton = await injectSudtCapacity(txSkeleton, [fromInfo], BigInt(targetOutput.data));

  // txSkeleton = await common.injectCapacity(
  //   txSkeleton,
  //   [fromInfo],
  //   BigInt(targetOutput.cell_output.capacity),
  //   undefined,
  //   tipHeader,
  //   {
  //     config,
  //   }
  // );

  return txSkeleton;
}

/**
 *
 * @param txSkeleton
 * @param fromInfos
 * @param sudtToken
 * @param toAddress
 * @param amount
 * @param changeAddress if not provided, will use first fromInfo
 * @param capacity
 * @param tipHeader
 * @param options
 */
export async function buyTokenSale(
  txSkeleton: TransactionSkeletonType,
  fromInfos: FromInfo[],
  sudtToken: Token,
  toAddress: Address,
  amount: bigint,
  changeAddress?: Address,
  capacity?: bigint,
  tipHeader?: Header,
  {
    config = undefined,
    LocktimePoolCellCollector = LocktimeCellCollector,
  }: Options & {
    LocktimePoolCellCollector?: any;
  } = {}
): Promise<TransactionSkeletonType> {
  config = config || getConfig();

  const SUDT_SCRIPT = config.SCRIPTS.SUDT;
  // const SUDT_SALE_SCRIPT = config.SCRIPTS.SUDT_SALE;

  if (!SUDT_SCRIPT) {
    throw new Error("Provided config does not have SUDT script setup!");
  }

  // if (!SUDT_SALE_SCRIPT) {
  //   throw new Error("Provided config does not have SUDT Sale script setup!");
  // }

  // if (fromInfos.length === 0) {
  //   throw new Error("`fromInfos` can't be empty!");
  // }

  // if (!toAddress) {
  //   throw new Error("You must provide a to address!");
  // }
  // const toScript = parseAddress(toAddress, { config });

  // const fromScripts: Script[] = fromInfos.map(
  //   (fromInfo) => parseFromInfo(fromInfo, { config }).fromScript
  // );
  // const changeOutputLockScript = changeAddress
  //   ? parseAddress(changeAddress, { config })
  //   : fromScripts[0];

  // amount = BigInt(amount);
  // if (amount <= 0n) {
  //   throw new Error("amount must be greater than 0");
  // }

  // const sudtType = _generateSudtScript(sudtToken, config);

  // const cellProvider = txSkeleton.get("cellProvider");
  // if (!cellProvider) {
  //   throw new Error("Cell provider is missing!");
  // }

  // // if toScript is an anyone-can-pay script
  // let toAddressInputCapacity: bigint = 0n;
  // let toAddressInputAmount: bigint = 0n;
  // if (isAcpScript(toScript, config)) {
  //   const toAddressCellCollector = new AnyoneCanPayCellCollector(
  //     toAddress,
  //     // @ts-ignore

  //     cellProvider,
  //     {
  //       config,
  //       queryOptions: {
  //         type: sudtType,
  //         data: "any",
  //       },
  //     }
  //   );

  //   const toAddressInput: Cell | void = (
  //     await toAddressCellCollector.collect().next()
  //   ).value;
  //   if (!toAddressInput) {
  //     throw new Error(`toAddress ANYONE_CAN_PAY input not found!`);
  //   }

  //   txSkeleton = txSkeleton.update("inputs", (inputs) => {
  //     return inputs.push(toAddressInput);
  //   });

  //   txSkeleton = txSkeleton.update("witnesses", (witnesses) => {
  //     return witnesses.push("0x");
  //   });

  //   toAddressInputCapacity = BigInt(toAddressInput.cell_output.capacity);
  //   toAddressInputAmount = readBigUInt128LE(toAddressInput.data);
  // }

  // const targetOutput: Cell = {
  //   cell_output: {
  //     capacity: "0x0",
  //     lock: toScript,
  //     type: sudtType,
  //   },
  //   data: toBigUInt128LE(amount),
  //   out_point: undefined,
  //   block_hash: undefined,
  // };
  // if (capacity) {
  //   capacity = BigInt(capacity);
  // }
  // if (isAcpScript(toScript, config)) {
  //   if (!capacity) {
  //     capacity = 0n;
  //   }
  //   targetOutput.cell_output.capacity =
  //     "0x" + (toAddressInputCapacity + capacity).toString(16);
  //   targetOutput.data = toBigUInt128LE(toAddressInputAmount + BigInt(amount));
  // } else {
  //   if (!capacity) {
  //     capacity = minimalCellCapacity(targetOutput);
  //   }
  //   targetOutput.cell_output.capacity = "0x" + capacity.toString(16);
  // }

  // // collect cells with which includes sUDT info
  // txSkeleton = txSkeleton.update("outputs", (outputs) => {
  //   return outputs.push(targetOutput);
  // });

  // txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
  //   return fixedEntries.push({
  //     field: "outputs",
  //     index: txSkeleton.get("outputs").size - 1,
  //   });
  // });

  // txSkeleton = addCellDep(txSkeleton, {
  //   out_point: {
  //     tx_hash: SUDT_SCRIPT.TX_HASH,
  //     index: SUDT_SCRIPT.INDEX,
  //   },
  //   dep_type: SUDT_SCRIPT.DEP_TYPE,
  // });

  // // collect cells
  // const changeCell: Cell = {
  //   cell_output: {
  //     capacity: "0x0",
  //     lock: changeOutputLockScript,
  //     type: sudtType,
  //   },
  //   data: toBigUInt128LE(0n),
  //   out_point: undefined,
  //   block_hash: undefined,
  // };
  // const changeCellWithoutSudt: Cell = {
  //   cell_output: {
  //     capacity: "0x0",
  //     lock: changeOutputLockScript,
  //     type: undefined,
  //   },
  //   data: "0x",
  //   out_point: undefined,
  //   block_hash: undefined,
  // };
  // let changeCapacity = BigInt(0);
  // let changeAmount = BigInt(0);
  // let previousInputs = Set<string>();
  // for (const input of txSkeleton.get("inputs")) {
  //   previousInputs = previousInputs.add(
  //     `${input.out_point!.tx_hash}_${input.out_point!.index}`
  //   );
  // }
  // let cellCollectorInfos: List<{
  //   cellCollector: CellCollectorInterface;
  //   index: number;
  //   isAnyoneCanPay?: boolean;
  //   destroyable?: boolean;
  // }> = List();
  // if (tipHeader) {
  //   fromInfos.forEach((fromInfo, index) => {
  //     const locktimePoolCellCollector = new LocktimePoolCellCollector(
  //       fromInfo,
  //       cellProvider,
  //       {
  //         config,
  //         tipHeader,
  //         queryOptions: {
  //           type: sudtType,
  //           data: "any",
  //         },
  //       }
  //     );

  //     cellCollectorInfos = cellCollectorInfos.push({
  //       cellCollector: locktimePoolCellCollector,
  //       index,
  //     });
  //   });
  // }
  // fromInfos.forEach((fromInfo, index) => {
  //   const secpCollector = new secp256k1Blake160.CellCollector(
  //     fromInfo,
  //     // @ts-ignore

  //     cellProvider,
  //     {
  //       config,
  //       queryOptions: {
  //         type: sudtType,
  //         data: "any",
  //       },
  //     }
  //   );
  //   const multisigCollector = new secp256k1Blake160Multisig.CellCollector(
  //     fromInfo,
  //     // @ts-ignore

  //     cellProvider,
  //     {
  //       config,
  //       queryOptions: {
  //         type: sudtType,
  //         data: "any",
  //       },
  //     }
  //   );
  //   const acpCollector = new anyoneCanPay.CellCollector(
  //     fromInfo,
  //     // @ts-ignore

  //     cellProvider,
  //     {
  //       config,
  //       queryOptions: {
  //         type: sudtType,
  //         data: "any",
  //       },
  //     }
  //   );

  //   cellCollectorInfos = cellCollectorInfos.push(
  //     {
  //       cellCollector: secpCollector,
  //       index,
  //     },
  //     {
  //       cellCollector: multisigCollector,
  //       index,
  //     },
  //     {
  //       cellCollector: acpCollector,
  //       index,
  //       isAnyoneCanPay: true,
  //       destroyable: parseFromInfo(fromInfo, { config }).destroyable,
  //     }
  //   );
  // });
  // if (tipHeader) {
  //   fromInfos.forEach((fromInfo, index) => {
  //     const locktimeCellCollector = new LocktimePoolCellCollector(
  //       fromInfo,
  //       cellProvider,
  //       {
  //         config,
  //         tipHeader,
  //       }
  //     );

  //     cellCollectorInfos = cellCollectorInfos.push({
  //       cellCollector: locktimeCellCollector,
  //       index,
  //     });
  //   });
  // }
  // fromInfos.forEach((fromInfo, index) => {
  //   const secpCollector = new secp256k1Blake160.CellCollector(
  //     fromInfo,
  //     // @ts-ignore
  //     cellProvider,
  //     {
  //       config,
  //     }
  //   );
  //   const multisigCollector = new secp256k1Blake160Multisig.CellCollector(
  //     fromInfo,
  //     // @ts-ignore
  //     cellProvider,
  //     {
  //       config,
  //     }
  //   );
  //   const acpCollector = new anyoneCanPay.CellCollector(
  //     fromInfo,
  //     // @ts-ignore

  //     cellProvider,
  //     {
  //       config,
  //     }
  //   );

  //   cellCollectorInfos = cellCollectorInfos.push(
  //     {
  //       cellCollector: secpCollector,
  //       index,
  //     },
  //     {
  //       cellCollector: multisigCollector,
  //       index,
  //     },
  //     {
  //       cellCollector: acpCollector,
  //       index,
  //       isAnyoneCanPay: true,
  //       destroyable: parseFromInfo(fromInfo, { config }).destroyable,
  //     }
  //   );
  // });
  // for (const {
  //   index,
  //   cellCollector,
  //   isAnyoneCanPay,
  //   destroyable,
  // } of cellCollectorInfos) {
  //   for await (const inputCell of cellCollector.collect()) {
  //     // skip inputs already exists in txSkeleton.inputs
  //     const key = `${inputCell.out_point!.tx_hash}_${
  //       inputCell.out_point!.index
  //     }`;
  //     if (previousInputs.has(key)) {
  //       continue;
  //     }
  //     previousInputs = previousInputs.add(key);

  //     const fromInfo = fromInfos[index];
  //     txSkeleton = await common.setupInputCell(
  //       txSkeleton,
  //       inputCell,
  //       fromInfo,
  //       {
  //         config,
  //       }
  //     );
  //     // remove output which added by `setupInputCell`
  //     const lastOutputIndex: number = txSkeleton.get("outputs").size - 1;
  //     txSkeleton = txSkeleton.update("outputs", (outputs) => {
  //       return outputs.remove(lastOutputIndex);
  //     });
  //     // remove output fixedEntry
  //     const fixedEntryIndex: number = txSkeleton
  //       .get("fixedEntries")
  //       .findIndex((fixedEntry) => {
  //         return (
  //           fixedEntry.field === "outputs" &&
  //           fixedEntry.index === lastOutputIndex
  //         );
  //       });
  //     if (fixedEntryIndex >= 0) {
  //       txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
  //         return fixedEntries.remove(fixedEntryIndex);
  //       });
  //     }

  //     const inputCapacity: bigint = BigInt(inputCell.cell_output.capacity);
  //     const inputAmount: bigint = inputCell.cell_output.type
  //       ? readBigUInt128LE(inputCell.data)
  //       : 0n;
  //     let deductCapacity: bigint =
  //       isAnyoneCanPay && !destroyable
  //         ? inputCapacity - minimalCellCapacity(inputCell)
  //         : inputCapacity;
  //     let deductAmount: bigint = inputAmount;
  //     if (deductCapacity > capacity) {
  //       deductCapacity = capacity;
  //     }
  //     capacity -= deductCapacity;
  //     const currentChangeCapacity: bigint = inputCapacity - deductCapacity;
  //     if (!isAnyoneCanPay || (isAnyoneCanPay && destroyable)) {
  //       changeCapacity += currentChangeCapacity;
  //     }
  //     if (deductAmount > amount) {
  //       deductAmount = amount;
  //     }
  //     amount -= deductAmount;
  //     const currentChangeAmount: bigint = inputAmount - deductAmount;
  //     if (!isAnyoneCanPay || (isAnyoneCanPay && destroyable)) {
  //       changeAmount += currentChangeAmount;
  //     }

  //     if (isAnyoneCanPay && !destroyable) {
  //       const acpChangeCell: Cell = {
  //         cell_output: {
  //           capacity: "0x" + currentChangeCapacity.toString(16),
  //           lock: inputCell.cell_output.lock,
  //           type: inputCell.cell_output.type,
  //         },
  //         data: inputCell.cell_output.type
  //           ? toBigUInt128LE(currentChangeAmount)
  //           : "0x",
  //       };

  //       txSkeleton = txSkeleton.update("outputs", (outputs) => {
  //         return outputs.push(acpChangeCell);
  //       });

  //       if (inputCell.cell_output.type) {
  //         txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
  //           return fixedEntries.push({
  //             field: "outputs",
  //             index: txSkeleton.get("outputs").size - 1,
  //           });
  //         });
  //       }
  //     }

  //     // changeAmount = 0n, the change output no need to include sudt type script
  //     if (
  //       capacity === 0n &&
  //       amount === 0n &&
  //       ((changeCapacity === 0n && changeAmount === 0n) ||
  //         (changeCapacity > minimalCellCapacity(changeCellWithoutSudt) &&
  //           changeAmount === 0n))
  //     ) {
  //       changeCell.cell_output.type = undefined;
  //       changeCell.data = "0x";
  //       break;
  //     }
  //     if (
  //       capacity === 0n &&
  //       amount === 0n &&
  //       changeCapacity > minimalCellCapacity(changeCellWithoutSudt) &&
  //       changeAmount > 0n
  //     ) {
  //       break;
  //     }
  //   }
  // }

  // // if change cell is an anyone-can-pay cell and exists in txSkeleton.get("outputs")
  // let changeOutputIndex = -1;
  // if (
  //   isAcpScript(changeCell.cell_output.lock, config) &&
  //   (changeOutputIndex = txSkeleton.get("outputs").findIndex((output) => {
  //     return new ScriptValue(changeCell.cell_output.lock, {
  //       validate: false,
  //     }).equals(new ScriptValue(output.cell_output.lock, { validate: false }));
  //   })) !== -1
  // ) {
  //   txSkeleton.update("outputs", (outputs) => {
  //     return outputs.update(changeOutputIndex, (output) => {
  //       const clonedOutput: Cell = JSON.parse(JSON.stringify(output));
  //       clonedOutput.cell_output.capacity =
  //         "0x" +
  //         (BigInt(output.cell_output.capacity) + changeCapacity).toString(16);
  //       clonedOutput.data = toBigUInt128LE(
  //         readBigUInt128LE(output.data) + changeAmount
  //       );

  //       return clonedOutput;
  //     });
  //   });
  // } else if (changeCapacity >= minimalCellCapacity(changeCell)) {
  //   changeCell.cell_output.capacity = "0x" + changeCapacity.toString(16);
  //   if (changeAmount > 0n) {
  //     changeCell.data = toBigUInt128LE(changeAmount);
  //   }
  //   txSkeleton = txSkeleton.update("outputs", (outputs) =>
  //     outputs.push(changeCell)
  //   );
  //   if (changeAmount > 0n) {
  //     txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
  //       return fixedEntries.push({
  //         field: "outputs",
  //         index: txSkeleton.get("outputs").size - 1,
  //       });
  //     });
  //   }
  // } else if (
  //   changeAmount > 0n &&
  //   changeCapacity < minimalCellCapacity(changeCell)
  // ) {
  //   throw new Error("Not enough capacity for change in from infos!");
  // }
  // if (capacity > 0) {
  //   throw new Error("Not enough capacity in from infos!");
  // }
  // if (amount > 0) {
  //   throw new Error("Not enough amount in from infos!");
  // }

  return txSkeleton;
}

function _generateSudtScript(token: Hash, config: Config): Script {
  const SUDT_SCRIPT = config.SCRIPTS.SUDT!;
  // TODO: check token is a valid hash
  return {
    code_hash: SUDT_SCRIPT.CODE_HASH,
    hash_type: SUDT_SCRIPT.HASH_TYPE,
    args: token,
  };
}

export default {
  createTokenSale,
  buyTokenSale,
};