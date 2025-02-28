const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Bağlanmak istediğiniz sunucunun IP adresini girin: ", (ip) => {
    const client = net.createConnection({ host: ip, port: 12345 }, () => {
        console.log("[BAĞLANDI] Sunucuya bağlandınız.");
    });

    client.on("data", (data) => {
        console.log(data.toString().trim());
    });

    client.on("end", () => {
        console.log("[BAĞLANTI KESİLDİ] Sunucuyla bağlantınız kapatıldı.");
        process.exit();
    });

    rl.on("line", (input) => {
        if (input.trim().toLowerCase() === "çıkış") {
            client.end(); 
            rl.close();
        } else {
            client.write(input); 
        }
    });
});
