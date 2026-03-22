<?php
// ============================================================
//  KULLANICI YÖNETİMİ
//  Kullanıcı eklemek / şifre değiştirmek için bu dosyayı düzenleyin.
//
//  Yeni şifre hash'i üretmek için:
//  https://bcrypt-generator.com  (cost: 10)
//  veya terminalde: php -r "echo password_hash('sifreniz', PASSWORD_DEFAULT);"
// ============================================================

return [
    'admin' => [
        'password' => password_hash('termoland2024', PASSWORD_DEFAULT),
    ],
    'omer' => [
        'password' => password_hash('34ku2323', PASSWORD_DEFAULT),
    ],
    'ismet' => [
        'password' => password_hash('34dca618', PASSWORD_DEFAULT),
    ],
'fatih' => [
    'password' => password_hash('34fen022', PASSWORD_DEFAULT),
],
];

// ============================================================
//  ÖNEMLİ: Canlıya almadan önce şifreleri değiştirin!
//  Bu dosyayı public_html DIŞINA taşırsanız daha güvenli olur.
//  Örnek: /home/kullanici/termoland_config.php
//  Sonra save.php içindeki $configFile yolunu güncelleyin.
// ============================================================
