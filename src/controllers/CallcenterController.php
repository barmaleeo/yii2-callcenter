<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/4/18
 * Time: 16:39
 */

namespace barmaleeo\callcenter\controllers;

class CallcenterController extends \yii\base\Controller
{
    public function actionIndex(){

        return $this->render("view",[]);
    }
}