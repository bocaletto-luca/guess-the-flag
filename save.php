<?php
header('Content-Type: application/json');
$recordFile = 'record.json';

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['name']) || !isset($data['score'])) {
    http_response_code(400);
    echo json_encode(["error" => "Dati mancanti"]);
    exit;
}

$name = htmlspecialchars(trim($data['name']));
$score = intval($data['score']);

$newRecord = [
    "name"      => $name,
    "score"     => $score,
    "timestamp" => time()
];

if (file_exists($recordFile)) {
    $jsonRecords = file_get_contents($recordFile);
    $records = json_decode($jsonRecords, true);
    if (!is_array($records)) {
        $records = [];
    }
} else {
    $records = [];
}

$records[] = $newRecord;

if (file_put_contents($recordFile, json_encode($records, JSON_PRETTY_PRINT))) {
    echo json_encode(["success" => true, "record" => $newRecord]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Errore nel salvataggio del record"]);
}
?>
