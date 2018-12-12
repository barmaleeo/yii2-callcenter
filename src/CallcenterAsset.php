<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/5/18
 * Time: 02:09
 */

namespace barmaleeo\callcenter;


use yii\web\AssetBundle;

class CallcenterAsset extends AssetBundle
{
    public $sourcePath = '@vendor/barmaleeo/yii2-callcenter/dist';

    public $js = [
        'js/callcenter.js',
    ];
    public $css = [
        'css/callcenter.css',
    ];

    public function init()
    {
        if(isset(\Yii::$app->params['callcenter']['client']['depends'])){
            $this->depends[] = \Yii::$app->params['callcenter']['client']['depends'];
        }
        parent::init();
    }

    public $depends = [
        'yii\web\YiiAsset',
    ];

}