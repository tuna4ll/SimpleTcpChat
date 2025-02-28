# SimpleTcpChat - Node.js ile Basit Bir Chat Sunucu Uygulaması
# !! SSL KURMAYA ÜŞENDİM SSL KURMADAN KULLANMANIZ ÖNERİLMEZ !!
SimpleTcpChat, Node.js kullanarak oluşturulmuş basit bir chat sunucusudur. Bu proje, TCP soketleri üzerinden gerçek zamanlı iletişim desteği sağlar. Birden fazla kullanıcı farklı kanallara bağlanabilir, özel mesajlar gönderebilir ve kullanıcı doğrulaması yapabilir.

## Özellikler

- **Birden Fazla Kanal**: Kullanıcılar, `#genel`, `#kriptosignal`, `#teknoloji` gibi önceden tanımlanmış kanallara katılabilir.
- **Kullanıcı Kimlik Doğrulama**: Kullanıcılar, sisteme kaydolabilir, giriş yapabilir ve kimlik doğrulaması sonrası kanallara katılabilir.
- **Özel Mesaj Gönderme**: Kullanıcılar, başka kullanıcılara özel mesaj gönderebilir.
- **Banlama Özelliği**: Admin, kullanıcıları sunucudan yasaklayabilir.
- **Gerçek Zamanlı Yayın**: Mesajlar, bir kanalda bulunan tüm kullanıcılara gerçek zamanlı olarak iletilir.
- **Kanal Kullanıcı Sayısı**: Kullanıcılar, seçtikleri kanalda kaç kişi olduğunu görebilirler.

## Kurulum

1. Reposuyu klonlayın:
   ```
   git clone https://github.com/yourusername/SimpleSocketChat.git
   ```
2. Bağımlılıkları yükleyin:
    ```
    npm install
    ```
3. Sunucuyu başlatın:
    ```
    node server
    ```
## Sunucuya Giriş Yapma
 1. **Sunucuya Bağlantı Kurma:** Sunucu başlatıldıktan sonra, istemci bağlantısı yapabilir **(client.js kullanılarak veya putty gibi client kullanılarak)** . Bağlantı sağlandığında, kullanıcıdan sunucu şifresi istenir
 2. **Sunucu Şifresi Girme:** Bağlantı kuran kullanıcı, önceden belirlenmiş olan `SERVER_PASSWORD` şifresini girmelidir. Şifre doğru girildiğinde kullanıcıya giriş yapma veya kayıt olma seçenekleri sunulur.
 3. **Kayıt Olma:**
 - Kullanıcı, `register` komutunu girerse, kullanıcı adı seçmesi istenir.
 - Kullanıcı adı, 15 karakterden uzun olmamalıdır.
 - Kullanıcı adı mevcutsa, farklı bir kullanıcı adı seçmesi istenir.
 - Kullanıcı adı seçildikten sonra, şifre belirlenir ve kullanıcı kaydı tamamlanır.
 4. **Giriş Yapma:**
- Kullanıcı, `login` komutunu girerse, mevcut bir kullanıcı adı girerek sisteme giriş yapabilir.
- Kullanıcı adı ve şifre doğru girildiğinde, kullanıcı kanala katılmaya yönlendirilir.
 5. **Kanal Seçimi:** Kullanıcı, mevcut kanallar arasından bir kanal seçer ve bu kanal üzerinden mesajlaşmaya başlar.
 6. **Özel Mesaj Gönderme:** Kullanıcı, `@<kullanıcı_adı>` şeklinde bir komutla başka bir kullanıcıya özel mesaj gönderebilir.
## Admin Özellikleri
 - **Kullanıcı Banlama:** Sunucu yöneticisi, `/ban <kullanıcı_adı>` komutunu kullanarak bir kullanıcıyı yasaklayabilir. Yasaklanan kullanıcı, sunucuya tekrar bağlanamaz.
## Yapılandırma
- **Sunucu Şifresi:** `SERVER_PASSWORD` değerini server.js dosyasında değiştirerek sunucu şifresini ayarlayabilirsiniz.
- **Admin Şifresi:** `ADMIN_PASSWORD` değerini server.js dosyasında değiştirerek admin şifresini ayarlayabilirsiniz.
- **Kullanıcı Verisi:** Kullanıcılar, `users.json` dosyasına kaydedilir. Sunucuyu başlatmadan önce bu dosyanın oluşturulmuş olduğundan emin olun.
## Katkı
Bu projeye katkıda bulunmak isterseniz, repository’yi çatallayın, bir dal oluşturun ve pull request gönderin. Katkılarınız her zaman memnuniyetle karşılanacaktır!


