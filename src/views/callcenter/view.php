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
$operator =  \Yii::$app->getUser()->getIdentity();

$params['operator'] = [
    'id'        => $operator['id'],
    'operator'  => $operator['name']
];
$identity = Yii::$app->user->getIdentity();
$user = [
        'id' =>  $identity['id'],
        'hash' => $identity['ws_hash'],
];

\barmaleeo\callcenter\CallcenterAsset::register($this);


?>
<audio id="sound-phone" autoPlay="autoplay"></audio>
<div id="yii2-callcenter-root"
     data-options='<?=json_encode($params)?>'
     data-user='<?=json_encode($user)?>'>
    Loading...
</div>
