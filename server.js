const net = require("net");
const fs = require("fs");
const clients = [];
const channels = ['#genel', '#kriptosignal', '#teknoloji'];
const SERVER_PASSWORD = "gizliSifre"; // Sunucu şifresi
const SERVER_USERNAME = "server"; // Sunucu kullanıcı adı
const ADMIN_PASSWORD = "adminSifre"; // Admin şifresi
const MESSAGE_LENGTH_LIMIT = 90;
const USERNAME_LENGTH_LIMIT = 15;

// Renk kodları
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

// Sunucuyu oluştur
const server = net.createServer((socket) => {
    let clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    let username = '';
    let currentChannel = ''; 
    let authenticated = false; 

    console.log(`${colors.green}[BAĞLANTI] Yeni bir istemci bağlandı: ${clientAddress}${colors.reset}`);

    socket.write("Sunucuya bağlanmak için şifreyi girin:\n");

    socket.on("data", (data) => {
        const message = data.toString().trim();
        if (!authenticated) {
            if (message === SERVER_PASSWORD) {
                authenticated = true;
                socket.write("Şifre doğru. Hoş geldiniz! Lütfen 'login' veya 'register' komutunu girin:\n");
            } else {
                socket.write("Yanlış şifre. Bağlantı kesiliyor...\n");
                socket.end();
            }
        } else if (!username) {
            if (message === 'register') {
                socket.write("Kayıt için bir kullanıcı adı seçin:\n");
                socket.once("data", (usernameData) => {
                    const newUsername = usernameData.toString().trim();

                    if (newUsername.length > USERNAME_LENGTH_LIMIT) {
                        socket.write(`Kullanıcı adı çok uzun. En fazla ${USERNAME_LENGTH_LIMIT} karakter olmalı.\n`);
                        return;
                    }

                    fs.readFile('users.json', (err, data) => {
                        let users = [];
                        if (!err) {
                            users = JSON.parse(data);
                        }

                        if (users.some(user => user.username === newUsername)) {
                            socket.write("Bu kullanıcı adı zaten mevcut. Lütfen başka bir kullanıcı adı seçin:\n");
                            return;
                        }

                        socket.write("Şifre belirleyin:\n");
                        socket.once("data", (passwordData) => {
                            const password = passwordData.toString().trim();

                            const newUser = {
                                username: newUsername,
                                password: password,
                                banned: false, 
                            };

                            users.push(newUser);
                            fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
                                if (err) console.error(`${colors.red}Veri kaydedilemedi: ${err}${colors.reset}`);
                                else {
                                    username = newUsername;
                                    socket.write("Kayıt başarıyla tamamlandı! Şimdi bir kanal seçin:\n");
                                    socket.write(`Mevcut kanallar: ${channels.join(', ')}\n`);
                                }
                            });
                        });
                    });
                });
            } else if (message === 'login') {
                socket.write("Lütfen kullanıcı adınızı girin:\n");
                socket.once("data", (usernameData) => {
                    const loginUsername = usernameData.toString().trim();

                    const existingClient = clients.find(client => client.username === loginUsername && client.socket !== socket);
                    if (existingClient) {
                        socket.write("Bu kullanıcı adı şu anda aktif. Lütfen farklı bir kullanıcı adı girin.\n");
                        socket.end(); 
                        return;
                    }

                    fs.readFile('users.json', (err, data) => {
                        let users = [];
                        if (!err) {
                            users = JSON.parse(data);
                        }

                        const user = users.find(u => u.username === loginUsername);
                        if (user) {
                            if (user.banned) {
                                socket.write("Bu kullanıcı banlanmış. Sunucuya giriş yapamazsınız.\n");
                                socket.end();
                                return;
                            }

                            socket.write("Şifrenizi girin:\n");
                            socket.once("data", (passwordData) => {
                                const password = passwordData.toString().trim();
                                if (user.password === password) {
                                    username = loginUsername;
                                    socket.write("Giriş başarılı! Şimdi bir kanal seçin:\n");
                                    socket.write(`Mevcut kanallar: ${channels.join(', ')}\n`);
                                } else {
                                    socket.write("Yanlış şifre. Bağlantı kesiliyor...\n");
                                    socket.end();
                                }
                            });
                        } else {
                            socket.write("Kullanıcı adı bulunamadı. Lütfen kaydolun.\n");
                        }
                    });
                });
            } else {
                socket.write("Geçersiz komut. Lütfen 'login' veya 'register' yazın:\n");
            }
        } else if (!currentChannel) {
            if (channels.includes(message)) {
                currentChannel = message; 
                socket.write(`Kanal olarak ${currentChannel} seçildi.\n`);
                broadcast(`${colors.magenta}[SİSTEM]: ${username} ${currentChannel} kanalına katıldı.${colors.reset}`, socket, currentChannel);
                sendUserCountToAll(currentChannel);
            } else {
                socket.write("Hatalı kanal seçimi. Lütfen geçerli bir kanal seçin:\n");
                socket.write(`Mevcut kanallar: ${channels.join(', ')}\n`);
            }
        } else {
            if (message.length > MESSAGE_LENGTH_LIMIT) {
                socket.write(`Mesaj çok uzun. En fazla ${MESSAGE_LENGTH_LIMIT} karakter olmalı.\n`);
                return;
            }
            if (message.startsWith("/ban") && username === SERVER_USERNAME) {
                const targetUsername = message.split(" ")[1];
                if (!targetUsername) {
                    socket.write("Banlamak için bir kullanıcı adı girin.\n");
                    return;
                }
                

                fs.readFile('users.json', (err, data) => {
                    let users = [];
                    if (!err) {
                        users = JSON.parse(data);
                    }

                    const targetUser = users.find(u => u.username === targetUsername);
                    if (targetUser) {
                        targetUser.banned = 1;
                        fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
                            if (err) console.error(`${colors.red}Veri kaydedilemedi: ${err}${colors.reset}`);
                            else {
                                broadcast(`${colors.red}[SİSTEM]: ${targetUsername} kullanıcı adı banlandı.${colors.reset}`, socket, currentChannel);
                                sendUserCountToAll(currentChannel);
                                const targetClient = clients.find(client => client.username === targetUsername);
                                if (targetClient) {
                                    targetClient.socket.write("Hesabınız banlandı. Bağlantınız kesiliyor...\n");
                                    targetClient.socket.end();
                                    clients.splice(clients.findIndex(client => client.socket === targetClient.socket), 1); 
                                }
                            }
                        });
                    } else {
                        socket.write("Kullanıcı bulunamadı.\n");
                    }
                });
                return;
            }
            if (message.startsWith("@")) {
                const targetUsername = message.split(" ")[0].substring(1); 
                const privateMessage = message.split(" ").slice(1).join(" "); 
            
                const targetClient = clients.find(client => client.username === targetUsername);
                const serverClient = clients.find(client => client.username === SERVER_USERNAME);
                if (targetUsername === SERVER_USERNAME) {
                    socket.write("Server'a özel mesaj gönderilemez.\n");
                    return; 
                }

                if (targetClient) {
                    targetClient.socket.write(`${colors.cyan}[ÖZEL MESAJ - ${username}]: ${privateMessage}${colors.reset}\n`);
                    socket.write(`${colors.cyan}[ÖZEL MESAJ GÖNDERİLDİ - ${targetUsername}]: ${privateMessage}${colors.reset}\n`);
            
                    if (serverClient) {
                        serverClient.socket.write(`${colors.red}[ÖZEL MESAJ - ${username} -> ${targetUsername}]: ${privateMessage}${colors.reset}\n`);
                    }
                } else {
                    socket.write("Bu kullanıcı şu anda bağlı değil.\n");
                }
            } else {
                if (username === SERVER_USERNAME) {
                    broadcast(`${colors.red}[SERVER]: ${message}${colors.reset}`, socket, currentChannel);
                } else {
                    broadcast(`${colors.yellow}[${username}]: ${message}${colors.reset}`, socket, currentChannel);
                }
            }
        }
    });

    socket.on("close", () => {
        console.log(`${colors.red}[BAĞLANTI KESİLDİ]: ${clientAddress}${colors.reset}`);
        clients.splice(clients.findIndex((client) => client.socket === socket), 1); 
        broadcast(`${colors.magenta}[SİSTEM]: ${username} ${currentChannel} kanalından ayrıldı.${colors.reset}`, socket, currentChannel);
        sendUserCountToAll(currentChannel); 
    });

    socket.on("error", (err) => {
        console.log(`${colors.red}[HATA]: ${clientAddress} - ${err.message}${colors.reset}`);
    });

    clients.push({ socket, username, currentChannel });

    socket.on("data", (data) => {
        const message = data.toString().trim();
        if (authenticated && username && currentChannel) {
            clients.forEach(client => {
                if (client.socket === socket) {
                    client.username = username;
                    client.currentChannel = currentChannel;
                }
            });
        }
    });
});

function broadcast(message, senderSocket, channel) {
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    clients.forEach(({ socket, currentChannel }) => {
        if (socket !== senderSocket && currentChannel === channel) {
            socket.write(`[${timestamp}] ${message}\n`);
        }
    });
}

function broadcastToAllChannels(message) {
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    clients.forEach(({ socket }) => {
        socket.write(`[${timestamp}] ${message}\n`);
    });
}

function sendServerMessage(message, channel) {
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const formattedMessage = `${colors.red}[SERVER]: ${message}${colors.reset}`
    clients.forEach(({ socket, currentChannel }) => {
        if (currentChannel === channel) {
            socket.write(`[${timestamp}] ${formattedMessage}\n`);
        }
    });
}

function sendUserCount(socket, channel) {
    const userCount = clients.filter(client => client.currentChannel === channel).length;
    socket.write(`Bu kanalda ${userCount} kullanıcı var.\n`);
}

function sendUserCountToAll(channel) {
    const userCount = clients.filter(client => client.currentChannel === channel).length;
    const message = `${channel} kanalında ${userCount} kullanıcı mevcut.`;
    clients.forEach(({ socket, currentChannel }) => {
        if (currentChannel === channel) {
            socket.write(message + '\n');
        }
    });
}

const PORT = 12345;

server.listen(PORT, () => {
    console.log(`${colors.green}[SUNUCU] Dinleniyor... Port: ${PORT}${colors.reset}`);
    broadcastToAllChannels(`${colors.green}[SUNUCU] Sunucu başlatıldı... Port: ${PORT}${colors.reset}`);
});
