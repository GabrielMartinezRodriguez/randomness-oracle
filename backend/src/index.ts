import "dotenv/config";
import "reflect-metadata";
import { Container } from "inversify";
import { IWalletService, WalletSymbol } from "./Common/IWallet";
import { WalletService } from "./Wallet/WalletService";
import { DrandService } from "./Drand/DrandService";
import { TransactionMonitoringService } from "./MonitoringTransactions/TransactionMonitoring";
import {
  ITransactionMonitoring,
  TransactionMonitoringSymbol,
} from "./Common/ITransactionMonitoring";
import {
  TransactionRepository,
  TransactionRepositorySymbol,
} from "./Common/Repositories/ITransactionRepository";
import { SequencerService } from "./Sequencer/SequencerService";

const container = new Container();

container.bind(WalletSymbol).to(WalletService).inSingletonScope();
container
  .bind(TransactionRepositorySymbol)
  .to(TransactionRepository)
  .inSingletonScope();
container.bind(DrandService).toSelf().inSingletonScope();
container.bind(SequencerService).toSelf().inSingletonScope();
container
  .bind(TransactionMonitoringSymbol)
  .to(TransactionMonitoringService)
  .inSingletonScope();

const wallet = container.get<IWalletService>(WalletSymbol);
const drandService = container.get<DrandService>(DrandService);
const sequencerService = container.get<SequencerService>(SequencerService);
const transactionMonitoringService = container.get<ITransactionMonitoring>(
  TransactionMonitoringSymbol
);

(async () => {
  await wallet.initialize();
  await transactionMonitoringService.initialize(wallet);
  await drandService.initialize();
  await sequencerService.initialize();
})();
