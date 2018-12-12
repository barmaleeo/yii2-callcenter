<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/4/18
 * Time: 16:39
 */

namespace barmaleeo\callcenter\controllers;

use barmaleeo\callcenter\models\Call;
use barmaleeo\callcenter\models\CallType;

class CallcenterController extends \yii\base\Controller
{

    public function actionIndex(){

        return $this->render("view",[]);
    }

    public function actionGetOutcalls(){
        if($this->module->outcallsArray){
            $outcalls = [];
        }else{
            $outcalls = Call::find()
                ->where(['call.status_id' => Call::STATUS_READY])
                ->orderBy('call.created')
                ->asArray()
                ->all();
        }
        $types = CallType::find()->orderBy('id')->asArray()->all();
        $res = [
            'outcalls'  => $outcalls,
            'types'     => $types,
        ];
        \Yii::$app->response->data = json_encode($res);
    }
}