<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 2019-01-17
 * Time: 17:44
 */

\barmaleeo\callcenter\CallcenterAsset::register($this);

?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>" style="height: 100%">
    <head>
        <meta charset="<?= Yii::$app->charset ?>">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?php $this->head() ?>

    </head>
    <body style="height:100%">
        <?php $this->beginBody() ?>
            <?=$content?>
        <?php $this->endBody() ?>
    </body>
</html>
<?php $this->endPage() ?>


