export const STELLAR_CONFIG = {
  networkPassphrase:
    import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ||
    'Test SDF Network ; September 2015',
  rpcUrl:
    import.meta.env.VITE_SOROBAN_RPC_URL ||
    'https://soroban-testnet.stellar.org',
  contractId:
    import.meta.env.VITE_CONTRACT_ID ||
    'CCLQR3746SFXSBZT7MX7D7C2BEJ5TFGC5VBSFVJBF75B5MHDK7AH54IO',
  nativeTokenAddress:
    'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  appsScriptUrl:
    import.meta.env.VITE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwQpyYc6F29rGJMIjtCPDS0e7blFApI5A4iNscTpU6SRhK8VXnuePQ8YSP7AwxU62Y/exec',
};