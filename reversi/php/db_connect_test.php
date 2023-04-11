<?php 
    try {
        $dsn = 'mysql:host=db;dbname=docker_db;';
        $db = new PDO($dsn, 'docker_user', 'docker_pass');

        $sql = 'SELECT * FROM `TEST1_TABLE`;';
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        var_dump($result);
    } catch (PDOException $e) {
        echo $e->getMessage();
        exit;
    }
?>