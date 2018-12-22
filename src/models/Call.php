<?php

namespace barmaleeo\callcenter\models;

use Yii;
use yii\db\Expression;


/**
 * This is the model class for table "call".
 *
 * @property int $id
 * @property string $uuid
 * @property int $direction
 * @property int $type_id
 * @property int $phone_id
 * @property int $status_id
 * @property int $op_id
 * @property int $goal
 * @property string $enable_time
 * @property string $start_time
 * @property string $end_time
 * @property string $created
 * @property string $updated
 */
class Call extends \yii\db\ActiveRecord
{

    const STATUS_READY              = 0;   //  status = 0 - введен, активный статус
    const STATUS_RINGING            = 64;  //  status = 64 - входящий звонок
    const STATUS_CALLING            = 72;  //  status = 72 - старт вызова
    const STATUS_RECORD_MSG         = 73;  //  status = 73 - запись на автоответчик
    const STATUS_TAKEN              = 96;  //  status = 96 - Начало разговора
    const STATUS_CONN_ERROR         = 97;  //  status = 97  - ошибка соединения
    const STATUS_CLOSED_SYS         = 98;  //  status = 98  - снят системой
    const STATUS_NO_MEDIA           = 121; //  status = 121 - ошибка соединения - нажата кнопка "Не слышу абонента"
    const STATUS_MSG_BLOCKED        = 122; //  status = 122 - "абонент заблокирован"
    const STATUS_MSG_NO_ANSWER      = 123; //  status = 123 - "абонент не отвечает"
    const STATUS_NO_ANSWER          = 124; //  status = 124 - не отвечает
    const STATUS_BUSY               = 125; //  status = 125 - линия заняиа
    const STATUS_COMPLETED_CLIENT   = 126; //  status = 126 - завершен клиентом
    const STATUS_COMPLETED          = 127; //  status = 127 - завершен оператором
    const STATUS_CLOSED             = 128; //  status = 128 - закрыт супервайзером
    const STATUS_UNANSWERED         = 129; //  status = 129 - неотвечен
    const STATUS_AUTOANSWER_MSG     = 130; //  status = 130 - есть сообщение автоответчика

    const DIRECTION_OUTCALL = 0;
    const DIRECTION_INCALL  = 1;
    const DIRECTION_LOCAL   = 2;

    public $name;
    public $phone;
    public $user_id;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'call';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['type_id', 'direction', 'phone_id', 'status_id', 'op_id', 'goal'], 'integer'],
            [['enable_time', 'uuid'], 'safe'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id'            => Yii::t('common', 'ID'),
            'type_id'       => Yii::t('common', 'Type ID'),
            'phone_id'      => Yii::t('common', 'Phone ID'),
            'status_id'     => Yii::t('common', 'Status ID'),
            'op_id'         => Yii::t('common', 'Op ID'),
            'goal'          => Yii::t('common', 'Goal'),
            'enable_time'   => Yii::t('common', 'Enable Time'),
            'start_time'    => Yii::t('common', 'Start Time'),
            'end_time'      => Yii::t('common', 'End Time'),
            'created'       => Yii::t('common', 'Created'),
            'updated'       => Yii::t('common', 'Updated'),
        ];
    }

    public static function find()
    {
        return parent::find()
            ->select([
                'call.id',
                'call.type_id',
                'call.status_id',
                'call.phone_id',
                'user_phone.phone',
                'user.id AS user_id',
                'user.name',
                'call.created',
                'call.enable_time',
                'call.start_time',
            ])
            ->leftJoin('user_phone','user_phone.id=call.phone_id')
            ->leftJoin('user','user.id=user_phone.user_id')
            ->groupBy('call.id');
    }
    public static function startIncall($params){

        $strlen = preg_replace('/\D+/', '', $params['phone']);
        
        if(isset($params['phone']) && strlen(preg_replace('/[^0-9]+/', '', $params['phone'])) == 10) {

            $params['phone'] = static::complete($params['phone']);

            $clientClass = Yii::$app->params['callcenter']['client']['class'];
            
            $clients = $clientClass::findByPhoneNumber($params['phone']);

            if(count($clients) == 0){
                // создаем нового клиента по входящему звонку
                $client = $clientClass::createByPhoneCall($params['phone']);
                $callType = 1000;
                
            } else if(count($clients) == 1){
                // Пользователь определился однозначно
                $client = $clients[0];
                $callType = 1005;
            }else{
                // Определилось  несколько пользователей
                $client = $clients[0];
                $callType = 1005;
            }
                $call = new static();
                $call->status_id    = static::STATUS_RINGING;
                $call->phone_id     = $client->phone_id;
                $call->direction    = static::DIRECTION_INCALL;
                $call->start_time   = new Expression('NOW()');
                $call->type_id      = $callType;
                $call->uuid         = $params['uuid'];
                $call->save();

                $stats = [
                    'id'        => $client->id,
                    'call_id'   => $call->id,
                    'name'      => $client->name,
                ];

            return $stats;
        }

    }

    public static function makeOutcall($id){
        if($call = parent::findOne(['call.id' => $id, 'call.status_id' => Call::STATUS_READY])) {
            $call->status_id = Call::STATUS_CALLING;
            $call->op_id = Yii::$app->getUser()->getId();
            $call->save(false);

            $log = new CallLog();
            $log->call_id   = $call->id;
            $log->oid       = \Yii::$app->getUser()->getId();
            $log->event_id  = CallLog::CALL_EVENT_MAKE_OUTCALL;
            $res = $log->save(false);
        }
    }
    
    public static function startOutcall($params){
        if($call = parent::findOne(['call.id' => $params['callid'], 'call.status_id' => Call::STATUS_TAKEN])){

            $call->uuid      = $params['uuid'];
            $call->status_id = Call::STATUS_CALLING;
            $call->save(false);

            $log = new CallLog();
            $log->call_id   = $call->id;
            $log->oid     = $params['userid'];
            $log->event_id  = CallLog::CALL_EVENT_MAKE_OUTCALL;
            $res = $log->save(false);

        }

    }
    
    public static function finishCall($callUuid){
        
        if($call = parent::findOne(['uuid' => $callUuid])){

            $log = new CallLog();
            $log->call_id   = $call->id;
            $log->event_id  = CallLog::CALL_EVENT_FINISH;
            $res = $log->save(false);
            
        }
    }

    public static function answerCall($callUuid){

        if($call = parent::findOne(['uuid' => $callUuid])){

            $log = new CallLog();
            $log->call_id   = $call->id;
            $log->event_id  = CallLog::CALL_EVENT_ANSWER;
            $res = $log->save(false);

        }
    }

    public static function complete($phone1){
        $phone = preg_replace('/[^0-9]|i/','',$phone1);
        if(strlen($phone)==11) {
            return '3'.$phone;
        } else if(strlen($phone)==10){
            return '38'.$phone;
        } else if(strlen($phone)==9){
            return '380'.$phone;
        } else if(strlen($phone)==8){
            return '3805'.$phone;
        } else if(strlen($phone)==7){
            return '38056'.$phone;
        } else if(strlen($phone)==6){
            return '380562'.$phone;
        } else {
            return $phone;
        }

    }

    public function getPath($ext = 'mp3'){
        if ($this['direction'] == 1) {
            $date = strtotime($this->start_time);
            //$path = date("Y-m-d/", $date);
            $path = date("Ym/", $date);
        } else {
            $date = strtotime($this->start_time);
            //$path = date("Y-m-d/", $date);
            $path = date("Ym/", $date);
        }
        return \Yii::$app->basePath."/recordings/".$path;//."*" . $this->uuid . "*.".$ext;

    }

    public static function getPlayInfo($id, $ext = 'mp3'){

        if(!$call = parent::find()->where(['id' => $id])->one()){
            throw new \yii\web\HttpException(404);
        }
        $path = $call->getPath($ext);

        $files = glob($path . "*" . $call->uuid . "*.".$ext);

        if (count($files) > 0) {
            static::smartReadFile($files[0], 'audio/'.$ext);
        } else {
            throw new \yii\web\HttpException(404);
        }
    }

    public static function smartReadFile($location, $mimeType = 'application/octet-stream')
    {
        $headers = \Yii::$app->response->headers;

        if (!file_exists($location))
        {
            throw new \yii\web\HttpException(404);
        }

        $size	= filesize($location);
        $time	= date('r', filemtime($location));

        $fm		= @fopen($location, 'rb');
        if (!$fm)
        {
            throw new \yii\web\HttpException(505);
        }

        $begin	= 0;
        $end	= $size - 1;

        if (isset($_SERVER['HTTP_RANGE']))
        {
            if (preg_match('/bytes=\h*(\d+)-(\d*)[\D.*]?/i', $_SERVER['HTTP_RANGE'], $matches))
            {
                $begin	= intval($matches[1]);
                if (!empty($matches[2]))
                {
                    $end	= intval($matches[2]);
                }
            }
        }
        if (isset($_SERVER['HTTP_RANGE']))
        {
            Yii::$app->response->statusCode = 206;
        }
        else
        {
            Yii::$app->response->statusCode = 200;
        }

        $headers->add('Content-Type', $mimeType);
        $headers->add('Cache-Control', 'public, must-revalidate, max-age=0');
        $headers->add('Pragma', 'no-cache');
        $headers->add('Accept-Ranges', 'bytes');
        $headers->add('Content-Length', ($end - $begin) + 1);

        if (isset($_SERVER['HTTP_RANGE']))
        {
            $headers->add('Content-Range', "bytes $begin-$end/$size");
        }
        $headers->add('Content-Disposition', 'inline; filename='.pathinfo($location)['filename']);
        $headers->add('Content-Transfer-Encoding', 'binary');
        $headers->add('Last-Modified', $time);

        $cur	= $begin;
        fseek($fm, $begin, 0);

        \Yii::$app->response->format = \yii\web\Response::FORMAT_RAW;

        \Yii::$app->response->data = '';

        while(!feof($fm) && $cur <= $end /*&& (connection_status() == 0)*/)
        {
            \Yii::$app->response->data .= fread($fm, min(1024 * 16, ($end - $cur) + 1));
            $cur += 1024 * 16;
        }
    }



}
