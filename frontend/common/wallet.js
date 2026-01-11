export async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return null;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      alert("No wallet account found");
      return null;
    }

    return accounts[0];
  } catch (error) {
    console.error("MetaMask connection error:", error);

    if (error.code === 4001) {
      // User rejected request
      alert("Wallet connection request rejected");
    } else {
      alert("Failed to connect wallet");
    }

    return null;
  }
}
