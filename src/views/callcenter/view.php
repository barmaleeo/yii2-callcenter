<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/5/18
 * Time: 01:55
 */

\barmaleeo\callcenter\CallcenterAsset::register($this);

if(isset(Yii::$app->params['callcenter'])){
    $params = Yii::$app->params['callcenter'];
}else{
    $params = [];
}

?>

<div id="yii2-callcenter-root"
     data-options='<?=json_encode($params)?>'>
    Hello-hello-hello!
</div>
