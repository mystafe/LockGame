# minigames

Bu proje React ile geliştirilmiş bir mini oyun setidir. Sayısal kilit, Sudoku ve basit bir Kakuro bulmacası içerir. Kilit oyununda sistem rastgele hanelerden oluşan bir şifre belirler. Oyuncu rakamları yukarı/aşağı okları ile değiştirerek tahmin yapar. Toplam deneme hakkı seçilen zorluğa göre değişir. Kolay ve orta zorlukta birer ipucu kullanılabilir ve oyun her yenilendiğinde tema rastgele seçilir.

Sudoku oyununda üç zorluk seviyesi bulunur. Kolay seviyede 5x5 karelik mini bir Sudoku sunulur ve üç ipucu verilir. Orta seviyede 9x9 standart Sudoku daha fazla açık sayıyla gelir ve yine üç ipucu sağlanır. Zor seviyede 9x9 Sudoku daha az açık sayı içerir, üç yanılma hakkı ve tek ipucu vardır.

Beş kez oyun logosuna tıklanırsa **Süper Mod** aktif olur ve ipucu hakkı sınırsız hale gelir. Bu modda notları otomatik düzeltme düğmesi görünür.

Her tahmin sonrası sonuçlar renklerle gösterilir:

- **Yeşil:** Rakam doğru ve doğru sırada.
- **Sarı:** Rakam doğru fakat yanlış sırada.
- **Kırmızı:** Rakam şifre içinde bulunmuyor.

Tüm rakamlar doğru tahmin edildiğinde veya haklar bittiğinde oyun sona erer ve yeniden başlatma butonu görünür.

Kakuro oyununda ise satır ve sütunlardaki toplamları kullanarak boş kareleri doğru sayılarla doldurmaya çalışırsınız.

## Kurulum

1. Depoyu klonlayın ve proje dizinine girin.
2. Gerekli paketleri yüklemek için aşağıdaki komutları çalıştırın:

```bash
npm install
```

## Geliştirme Sunucusu

Aşağıdaki komut ile yerel geliştirme sunucusunu başlatabilirsiniz:

```bash
npm run dev
```

Sunucu çalıştığında tarayıcınızdan `http://localhost:5173` adresini ziyaret ederek oyunu oynayabilirsiniz.

