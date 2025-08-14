<?php
/**
 * AUTENTIFIKACE PROJEKTŮ
 * Tento skript zpracovává přihlášení do chráněných projektů
 */

// Spustit session
session_start();

// Nastavit hlavičky pro JSON odpověď
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Kontrola, zda je požadavek POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda není povolena']);
    exit;
}

// Načíst JSON data z požadavku
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Kontrola, zda jsou data validní
if (!$data || !isset($data['project']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Neplatná data']);
    exit;
}

$project = $data['project'];
$password = $data['password'];

// Konfigurace hesel pro projekty
$projectPasswords = [
    'project3' => 'tools2024',
    'project5' => 'blackjack2024',
    'project6' => 'dropshop2024',
    'project11' => 'krypto2024',
    'project13' => 'secret2024'
];

// Kontrola, zda je projekt chráněn
if (!isset($projectPasswords[$project])) {
    echo json_encode(['success' => false, 'message' => 'Projekt není chráněn']);
    exit;
}

// Kontrola hesla
if ($password === $projectPasswords[$project]) {
    // Úspěšné přihlášení - nastavit session
    $projectAuthKey = $project . '_auth';
    $_SESSION[$projectAuthKey] = true;
    
    // Nastavit cookie pro delší trvání (24 hodin)
    $cookieName = $project . '_auth';
    setcookie($cookieName, '1', time() + (24 * 60 * 60), '/', '', false, true);
    
    // Log úspěšného přihlášení
    logAccess($project, true, $_SERVER['REMOTE_ADDR']);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Přihlášení úspěšné',
        'project' => $project
    ]);
} else {
    // Neúspěšné přihlášení
    logAccess($project, false, $_SERVER['REMOTE_ADDR']);
    
    echo json_encode([
        'success' => false, 
        'message' => 'Nesprávné heslo'
    ]);
}

/**
 * Logování přístupů pro bezpečnost
 */
function logAccess($project, $success, $ip) {
    $logFile = 'access_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $status = $success ? 'SUCCESS' : 'FAILED';
    $logEntry = "[$timestamp] $project - $status - IP: $ip\n";
    
    // Přidat do log souboru (max 1000 řádků)
    if (file_exists($logFile)) {
        $lines = file($logFile);
        if (count($lines) > 1000) {
            $lines = array_slice($lines, -500);
        }
        file_put_contents($logFile, implode('', $lines) . $logEntry);
    } else {
        file_put_contents($logFile, $logEntry);
    }
}
?>
