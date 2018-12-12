<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/5/18
 * Time: 01:55
 */


if(isset(Yii::$app->params['callcenter'])){
    $params = Yii::$app->params['callcenter'];
}else{
    $params = [];
}
if(isset($params['sip']['source'])){
    $params['sip'] = array_merge($params['sip'], $params['sip']['source']());
}

\barmaleeo\callcenter\CallcenterAsset::register($this);


?>
<audio id="sound-phone" autoPlay="autoplay"></audio>
<div id="yii2-callcenter-root"
     data-options='<?=json_encode($params)?>'>
    Loading...
</div>
