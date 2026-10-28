<?php
/* Ғани Мұратбаев атындағы гимназия — API сайта.
   Запросы: /api/?a=db | rpc | upload | signup | login | logout | user | update_user | recover | verify | drive_me | ping */
define('GM', 1);
require __DIR__ . '/inc/core.php';
require __DIR__ . '/inc/schema.php';
require __DIR__ . '/inc/tables.php';
require __DIR__ . '/inc/rpc.php';
require __DIR__ . '/inc/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
// скрипт Google Диска обращается сюда со своих серверов, а сайт — со своего домена; браузерам с других сайтов не отвечаем
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, (array)cfg('allowed_origins', []), true)) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); header('Access-Control-Allow-Headers: Authorization, Content-Type'); }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') exit;

$a = (string)($_GET['a'] ?? '');
try {
  if (!cfg_file()) fail('Сайт ещё не настроен: откройте /api/install.php', 503, 'not_installed');
  if ($a === 'ping') out(['ok' => true, 'time' => gmdate('c')]);
  if ($a !== 'verify' && $a !== 'drive_me' && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('use POST', 405);
  housekeeping();
  switch ($a) {
    case 'db': handle_db(); break;
    case 'rpc': handle_rpc(); break;
    case 'upload': handle_upload(); break;
    case 'signup': auth_signup(); break;
    case 'login': auth_login(); break;
    case 'logout': auth_logout(); break;
    case 'user': auth_user(); break;
    case 'update_user': auth_update(); break;
    case 'recover': auth_recover(); break;
    case 'verify': header('Content-Type: text/html; charset=utf-8'); auth_verify(); break;
    case 'drive_me': handle_drive_me(); break;
  }
  fail('unknown action', 404);
} catch (ApiError $e) {
  http_response_code($e->http);
  echo json_encode(['data' => null, 'error' => ['message' => $e->getMessage(), 'code' => $e->codeStr]], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  error_log('gm api: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
  http_response_code(500);
  echo json_encode(['data' => null, 'error' => ['message' => 'server_error', 'code' => '500']], JSON_UNESCAPED_UNICODE);
}
