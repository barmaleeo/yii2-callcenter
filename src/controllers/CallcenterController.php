<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 11/4/18
 * Time: 16:39
 */

namespace barmaleeo\callcenter\controllers;

use app\modules\office\models\User;
use app\modules\office\models\UserTeam;
use barmaleeo\callcenter\models\Call;
use barmaleeo\callcenter\models\CallLog;
use barmaleeo\callcenter\models\CallType;
use yii\base\ViewNotFoundException;

class CallcenterController extends \yii\base\Controller
{
    /**
    * @param \yii\base\Action $action
    * @return bool
    * @throws \yii\db\Exception
    */
    public function beforeAction($action)
    {
        $id = isset(\Yii::$app->user)?\Yii::$app->user->getId():'0';
        \Yii::$app->db->createCommand("SET @userid=:userid, @langid=:langid",[
            'userid'    => $id,
            'langid'    => \Yii::$app->language,
        ])->execute();

        return parent::beforeAction($action);
    }


    public function actionIndex(){
        return $this->render("view",[]);
    }

    public function actionGetOutcalls(){
        if($this->module->outcallsArray){
            $outcalls = [];
        }else{
            $outcalls = Call::find()
                ->where(['call.status_id' => Call::STATUS_READY])
                ->orderBy('priority, attempt DESC, call.created')
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

    public function actionCallLog(){
        $params = \Yii::$app->request->get();

        $log = new CallLog();
        $log->load(['CallLog' => $params]);
        $log->save();

        \Yii::$app->response->data = 'ok';
    }

    public function actionMakeCall(){
        $id = \Yii::$app->request->get('id', 0);
        \Yii::$app->response->data = json_encode(Call::makeOutcall($id));
    }
    
    

    public function actionPlayCall()
    {
        $id = \Yii::$app->request->get('id', 0);
        if($id==0){
            throw new \yii\web\HttpException(404);
        }
        
        Call::getPlayInfo($id);

    }

    public function actionGetScript(){

        $raw = \Yii::$app->request->get();
        if(!isset($raw['url'])){
            $raw['url'] = 'index';
        }
        $script= "";


        if($call = Call::findOne($raw['id'])){
            $user = User::findByCallId($call->id)->all();
            $data = [
                'users'     => $user,
                'operator'  => \Yii::$app->getUser()->getIdentity()->name,
                'script'    => $call->type_id,
                'direction' => $call->direction,
            ];
            try{
                $script= $this->renderPartial('@app/callScripts/content/'.$data['script'].'/'.$raw['url'], ['data' => $data]);
            }catch(\Throwable $e){
                $script= $this->renderPartial('@app/callScripts/content/default/index', ['data' => $data]);
            }
        }
        \Yii::$app->response->data  = $script;
    }

    public function actionTestScript(){

        $raw = \Yii::$app->request->get();
        if(!isset($raw['url'])){
            $raw['url'] = 'index';
        }
        $script= "";


        if($call = Call::findOne($raw['id'])){
            $user = User::findByCallId($call->id)->all();
            $data = [
                'users'     => $user,
                'operator'  => \Yii::$app->getUser()->getIdentity()->name,
                'script'    => $call->type_id,
                'direction' => $call->direction,
            ];
            try{
                $script= $this->renderPartial('@app/callScripts/content/'.$data['script'].'/'.$raw['url'], ['data' => $data]);
            }catch(\Throwable $e){
                $script= $this->renderPartial('@app/callScripts/content/default/index', ['data' => $data]);
            }
        }
        $this->layout = 'testScript.php';
        return $this->render('testScript',['content' => $script]);

    }

    public function actionGetTransfers(){
        return $this->asJson(UserTeam::getTransfers());
    }

}