<?php
// ---------------------------------------------------------------
//  TERMOLAND — Güvenli Backend
//  - Şifreler config.php'de (ayrı dosya)
//  - Session: 30 dk hareketsizlikte otomatik çıkış
//  - Brute-force: 3 yanlış denemede 15 dk kilitleme
//  - data/ klasörü .htaccess ile dışardan erişime kapalı
// ---------------------------------------------------------------

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Strict');
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    ini_set('session.cookie_secure', 1);
}
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

define('SESSION_TIMEOUT',  30 * 60);
define('MAX_ATTEMPTS',     3);
define('LOCKOUT_TIME',     15 * 60);
define('DATA_DIR',         __DIR__ . '/data');
define('LOCK_DIR',         __DIR__ . '/data/locks');
define('CONFIG_FILE',      __DIR__ . '/config.php');

foreach ([DATA_DIR, LOCK_DIR] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0755, true);
}

if (!file_exists(CONFIG_FILE)) {
    http_response_code(500);
    echo json_encode(['error' => 'config.php bulunamadı']);
    exit;
}
$USERS = require CONFIG_FILE;

function lockFile($u) { return LOCK_DIR.'/'.preg_replace('/[^a-zA-Z0-9_\-]/','', $u).'.lock'; }
function dataFile($u) { return DATA_DIR.'/'.preg_replace('/[^a-zA-Z0-9_\-]/','', $u).'.json'; }

function isLocked($u) {
    $f=lockFile($u); if(!file_exists($f)) return false;
    $d=json_decode(file_get_contents($f),true);
    if(($d['attempts']??0)>=MAX_ATTEMPTS && time()-($d['last']??0)<LOCKOUT_TIME) return true;
    if(time()-($d['last']??0)>=LOCKOUT_TIME){ unlink($f); } return false;
}

function recordFail($u) {
    $f=lockFile($u);
    $d=file_exists($f)?json_decode(file_get_contents($f),true):['attempts'=>0];
    $d['attempts']=($d['attempts']??0)+1; $d['last']=time();
    file_put_contents($f,json_encode($d));
    return $d['attempts'];
}

function clearAttempts($u){ $f=lockFile($u); if(file_exists($f)) unlink($f); }

function remainingMins($u){
    $f=lockFile($u); if(!file_exists($f)) return 0;
    $d=json_decode(file_get_contents($f),true);
    return max(0,ceil((LOCKOUT_TIME-(time()-($d['last']??0)))/60));
}

function checkTimeout(){
    if(!empty($_SESSION['last_activity']) && time()-$_SESSION['last_activity']>SESSION_TIMEOUT){
        session_unset(); session_destroy();
        http_response_code(401);
        echo json_encode(['error'=>'Oturum süresi doldu (30 dk)','timeout'=>true]); exit;
    }
    $_SESSION['last_activity']=time();
}

$action = $_GET['action'] ?? '';

// --- LOGIN ---
if ($action==='login') {
    $b=json_decode(file_get_contents('php://input'),true);
    $user=trim($b['username']??''); $pass=$b['password']??'';
    if(!$user||!$pass){ http_response_code(400); echo json_encode(['error'=>'Boş alan bırakmayın']); exit; }
    if(isLocked($user)){ http_response_code(429); echo json_encode(['error'=>'Hesap kilitli. '.remainingMins($user).' dk bekleyin.']); exit; }
    if(isset($USERS[$user]) && password_verify($pass,$USERS[$user]['password'])){
        clearAttempts($user); session_regenerate_id(true);
        $_SESSION['user']=$user; $_SESSION['last_activity']=time();
        echo json_encode(['ok'=>true,'user'=>$user]);
    } else {
        $attempts=recordFail($user);
        $left=MAX_ATTEMPTS-$attempts;
        http_response_code(401);
        if($left>0) echo json_encode(['error'=>"Hatalı giriş. $left deneme hakkı kaldı."]);
        else echo json_encode(['error'=>'Hesap 15 dakika kilitlendi.']);
    }
    exit;
}

// --- LOGOUT ---
if ($action==='logout'){ session_unset(); session_destroy(); echo json_encode(['ok'=>true]); exit; }

// --- CHECK ---
if ($action==='check'){
    if(!empty($_SESSION['user'])){ checkTimeout(); echo json_encode(['ok'=>true,'user'=>$_SESSION['user']]); }
    else echo json_encode(['ok'=>false]);
    exit;
}

// Oturum zorunlu
if(empty($_SESSION['user'])){ http_response_code(401); echo json_encode(['error'=>'Oturum açılmamış','timeout'=>false]); exit; }
checkTimeout();
$user=$_SESSION['user'];
$file=dataFile($user);

// --- LOAD ---
if($_SERVER['REQUEST_METHOD']==='GET'){ echo file_exists($file)?file_get_contents($file):'[]'; exit; }

// --- SAVE ---
if($_SERVER['REQUEST_METHOD']==='POST'){
    $data=json_decode(file_get_contents('php://input'),true);
    if(json_last_error()!==JSON_ERROR_NONE){ http_response_code(400); echo json_encode(['error'=>'Geçersiz veri']); exit; }
    if(file_put_contents($file,json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT))!==false)
        echo json_encode(['ok'=>true]);
    else{ http_response_code(500); echo json_encode(['error'=>'Yazma hatası — data/ chmod 755 olmalı']); }
    exit;
}

http_response_code(405); echo json_encode(['error'=>'Method not allowed']);
