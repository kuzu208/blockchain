// --- CẤU HÌNH THÔNG TIN SMART CONTRACT ---
const CONTRACT_ADDRESS = "0x28428b974E80c7C9267adf914C02bAA76D1E5AB2"; 

const CONTRACT_ABI = [
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"},{"internalType":"uint256","name":"dienTich","type":"uint256"},{"internalType":"address","name":"chuDauTien","type":"address"}],
      "name": "dangKyThuaDat",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"},{"internalType":"address","name":"chuMoi","type":"address"}],
      "name": "chuyenNhuong",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"}],
      "name": "xemChuSoHuu",
      "outputs": [{"internalType":"address","name":"","type":"address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"}],
      "name": "xemDienTich",
      "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"}],
      "name": "xemLichSuChuyenNhuong",
      "outputs": [{"components":[{"internalType":"address","name":"chuCu","type":"address"},{"internalType":"address","name":"chuMoi","type":"address"},{"internalType":"uint256","name":"thoiGian","type":"uint256"}], "internalType":"struct QuanLyDatDai.ChuyenNhuong[]", "name":"","type":"tuple[]"}],
      "stateMutability": "view",
      "type": "function"
    }
];

let provider;
let signer;

async function getContractWithSigner() {
    if (!window.ethereum) {
        alert("Vui lòng cài đặt ví MetaMask!");
        throw new Error("MetaMask not found");
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Tra cứu thửa đất
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maSo = document.getElementById('searchId').value.trim();
    const resultDiv = document.getElementById('landInfo');
    resultDiv.innerHTML = "⏳ Đang truy vấn trên mạng Sepolia...";
    
    try {
        const readProvider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
        
        const chuSoHuu = await readContract.xemChuSoHuu(maSo);
        const dienTich = await readContract.xemDienTich(maSo);
        const lichSu = await readContract.xemLichSuChuyenNhuong(maSo);

        let historyHtml = lichSu.length === 0 ? "<li>Chưa có lịch sử chuyển nhượng</li>" : lichSu.map(item => `<li>Từ: <code>${item.chuCu}</code> ➔ Đến: <code>${item.chuMoi}</code></li>`).join('');

        resultDiv.innerHTML = `
            ✅ <strong>Thông tin thửa đất số ${maSo}:</strong><br>
            - <strong>Diện tích:</strong> ${dienTich.toString()} m²<br>
            - <strong>Chủ sở hữu hiện tại:</strong> <code>${chuSoHuu}</code><br>
            - <strong>Lịch sử giao dịch:</strong><ul>${historyHtml}</ul>
        `;
    } catch (err) {
        resultDiv.innerHTML = `❌ Không tìm thấy thửa đất số ${maSo} hoặc lỗi hệ thống!`;
    }
});

// Đăng ký thửa đất
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maSo = document.getElementById('landId').value.trim();
    const dienTich = document.getElementById('area').value.trim();
    const chuDauTien = document.getElementById('firstOwner').value.trim();

    try {
        const contractWithSigner = await getContractWithSigner();
        alert("⏳ Vui lòng xác nhận giao dịch trên MetaMask...");
        const tx = await contractWithSigner.dangKyThuaDat(maSo, dienTich, chuDauTien);
        alert("🚀 Đã gửi giao dịch! TxHash: " + tx.hash);
        await tx.wait();
        alert("🎉 Đăng ký thửa đất thành công!");
    } catch (err) {
        alert("❌ Lỗi: " + (err.data?.message || err.message));
    }
});

// Chuyển nhượng thửa đất
document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maSo = document.getElementById('transferId').value.trim();
    const chuMoi = document.getElementById('newOwner').value.trim();

    try {
        const contractWithSigner = await getContractWithSigner();
        alert("⏳ Vui lòng xác nhận giao dịch chuyển nhượng trên MetaMask...");
        const tx = await contractWithSigner.chuyenNhuong(maSo, chuMoi);
        alert("🚀 Đã gửi giao dịch chuyển nhượng! TxHash: " + tx.hash);
        await tx.wait();
        alert("🎉 Chuyển nhượng thành công!");
    } catch (err) {
        alert("❌ Lỗi: " + (err.data?.message || err.message));
    }
});
