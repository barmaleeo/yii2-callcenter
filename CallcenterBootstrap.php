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
        $app->on(Application::EVENT_BEFORE_REQUEST, function () {
            // do something here
        });
    }
}