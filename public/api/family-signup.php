<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['message' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

function setting(string $name, ?string $default = null): ?string
{
    $value = getenv($name);
    if ($value === false || trim($value) === '') $value = $_SERVER[$name] ?? $default;
    return is_string($value) ? trim($value) : $default;
}

function postToMautic(string $url, array $fields): int
{
    $body = http_build_query($fields, '', '&', PHP_QUERY_RFC3986);
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded', 'Accept: text/html,application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_USERAGENT => 'MartinFamilySignup/1.0',
        ]);
        $result = curl_exec($curl);
        if ($result === false) {
            error_log('Family signup Mautic request failed: ' . curl_error($curl));
            curl_close($curl);
            return 0;
        }
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);
        return $status;
    }

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\nAccept: text/html,application/json\r\nUser-Agent: MartinFamilySignup/1.0\r\n",
        'content' => $body,
        'ignore_errors' => true,
        'timeout' => 12,
        'follow_location' => 0,
    ]]);
    $result = @file_get_contents($url, false, $context);
    if ($result === false && empty($http_response_header)) return 0;
    $statusLine = $http_response_header[0] ?? '';
    return preg_match('/\s(\d{3})\s/', $statusLine, $matches) ? (int) $matches[1] : 0;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, 'Method not allowed.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) respond(413, 'Request too large.');

$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
if (str_contains($contentType, 'application/json')) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($input)) respond(400, 'Invalid request.');
} else {
    $input = $_POST;
}

// Bots commonly fill this hidden field. Return success without forwarding so it reveals nothing useful.
if (trim((string) ($input['website'] ?? '')) !== '') respond(200, 'You’re on the list.');

$firstName = trim((string) ($input['firstName'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
if ($firstName === '' || mb_strlen($firstName) > 80) respond(422, 'Please enter your name.');
if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) respond(422, 'Please enter a valid email address.');

$baseUrl = rtrim((string) setting('MAUTIC_BASE_URL'), '/');
$formId = (string) setting('MAUTIC_FORM_ID');
$firstNameAlias = (string) setting('MAUTIC_FIRST_NAME_ALIAS', 'firstname');
$emailAlias = (string) setting('MAUTIC_EMAIL_ALIAS', 'email');
if ($baseUrl === '' || !ctype_digit($formId)) {
    error_log('Family signup is missing MAUTIC_BASE_URL or MAUTIC_FORM_ID.');
    respond(503, 'Signup is being connected. Please try again soon.');
}
$parts = parse_url($baseUrl);
$allowHttp = setting('MAUTIC_ALLOW_HTTP', 'false') === 'true';
if (!is_array($parts) || empty($parts['host']) || (($parts['scheme'] ?? '') !== 'https' && !$allowHttp)) {
    error_log('Family signup has an invalid MAUTIC_BASE_URL.');
    respond(503, 'Signup is being connected. Please try again soon.');
}
foreach ([$firstNameAlias, $emailAlias] as $alias) {
    if (!preg_match('/^[A-Za-z0-9_]+$/', $alias)) {
        error_log('Family signup has an invalid Mautic field alias.');
        respond(503, 'Signup is being connected. Please try again soon.');
    }
}

$mauticFields = [
    "mauticform[$firstNameAlias]" => $firstName,
    "mauticform[$emailAlias]" => $email,
    'mauticform[formId]' => $formId,
    'mauticform[return]' => '',
];
$status = postToMautic($baseUrl . '/form/submit?formId=' . rawurlencode($formId), $mauticFields);
if ($status < 200 || $status >= 400) {
    error_log("Family signup Mautic returned HTTP $status.");
    respond(502, 'We couldn’t save your signup. Please try again.');
}
respond(200, 'You’re on the list.');
