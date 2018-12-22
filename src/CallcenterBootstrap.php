<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/2/18
 * Time: 21:23
 */

namespace barmaleeo\callcenter;

use yii\base\BootstrapInterface;
use yii\base\Application;

class CallcenterBootstrap implements BootstrapInterface
{
    public function bootstrap($app)
    {
//        $app->on(Application::EVENT_BEFORE_REQUEST, function () {
            // do something here
            $app = \Yii::$app;
            $app->getUrlManager()->addRules([
                ['class' => 'yii\web\UrlRule', 'pattern' => 'callcenter',               'route' =>  'callcenter/callcenter/index'],
                ['class' => 'yii\web\UrlRule', 'pattern' => 'callcenter/get-outcalls',  'route' =>  'callcenter/callcenter/get-outcalls'],
                ['class' => 'yii\web\UrlRule', 'pattern' => 'callcenter/call-log',      'route' =>  'callcenter/callcenter/call-log'],
                ['class' => 'yii\web\UrlRule', 'pattern' => 'callcenter/make-call',     'route' =>  'callcenter/callcenter/make-call'],
                ['class' => 'yii\web\UrlRule', 'pattern' => 'callcenter/play-call',     'route' =>  'callcenter/callcenter/play-call'],
//                ['class' => 'yii\web\UrlRule', 'pattern' => $this->id . '/<id:\w+>', 'route' => $this->id . '/default/view'],
//                ['class' => 'yii\web\UrlRule', 'pattern' => $this->id . '/<controller:[\w\-]+>/<action:[\w\-]+>', 'route' => $this->id . '/<controller>/<action>'],
            ], false);
//        });
    }
}