<?php

namespace barmaleeo\callcenter\models;

use app\modules\office\models\User;
use app\modules\office\models\UserPhone;
use Yii;

/**
 * This is the model class for table "call_log".
 *
 * @property int $id
 * @property int $call_id
 * @property int $event_id
 * @property int $oid
 * @property string $comment
 * @property string $created
 */
class CallLog extends \yii\db\ActiveRecord
{
    const CALL_EVENT_ACTIVE                 = 0;
    const CALL_EVENT_ERROR                  = 1;
    const CALL_EVENT_CALLING                = 2; // progress
    const CALL_EVENT_BUSY                   = 3; // busy
    const CALL_EVENT_NO_ANSWER              = 4; // no_answer или нажата кнопка не отвечает
    const CALL_EVENT_MAKE_OUTCALL           = 5;
    const CALL_EVENT_ANSWER                 = 6;
    const CALL_EVENT_RINGING                = 7;
    const CALL_EVENT_SELECT_CLIENT          = 8; // выбран клиент - DEPRECATED
    const CALL_EVENT_PRESS_ACCEPT           = 9; // 
    const CALL_EVENT_ACCEPTED               = 10;
    const CALL_EVENT_PRESS_NO_ANSWER        = 11; // нажата кнопка Абонент не отвечает
    const CALL_EVENT_PRESS_BLOCKED          = 12; // нажата кнопка Абонент заблокирован
    const CALL_EVENT_BYE                    = 13;
    const CALL_EVENT_PRESS_CANCEL           = 14; //
    const CALL_EVENT_CLOSE_CALL             = 15; // Закрыт оператором
    const CALL_EVENT_MUTED                  = 17;
    const CALL_EVENT_UNMUTED                = 18;
    const CALL_EVENT_START_VOICEMAIL        = 19;
    const CALL_EVENT_PRESS_VOICEMAIL        = 20;
    //const CALL_EVENT_RINGING                = 0;
    const CALL_EVENT_OUTGOING_TERMINATED    = 301;
    const CALL_EVENT_INCALL_REJECTED        = 302;
    const CALL_EVENT_FINISH                 = 307;
    const CALL_EVENT_END_VOICEMAIL          = 308;


    public function beforeSave($insert)
    {

        $this->oid = Yii::$app->user->getId();


        $call = Call::findOne(['call.id' => $this->call_id]);

        if ($call['direction']== Call::DIRECTION_OUTCALL) { // исходящие звонки
            switch (intval($this->event_id)) {
                case static::CALL_EVENT_CALLING: // Trying - progress
                    break;
                case static::CALL_EVENT_ERROR: // Ошибка вызова
//                case '9': // оператор нажал кнопку "Не слышу абонента"
//                    PhoneCall::addOutcall(0, $call->type, 0,
//                        $call->phone_id, $call->delivery_id, $call->attempt);
//                    break;
                case static::CALL_EVENT_BUSY:       // Номер занят
                case static::CALL_EVENT_NO_ANSWER:  // Номер не отвечает
                case 60:// Абонент недоступен
                case 61:// Автоответчик
                case 62:// В сети не зарегистрирован
                    $nextAttempt = ++$call->attempt;
                    switch($call->attempt){
                        case '0':
                        case '1':
                            $date = date('Y-m-d H:i',time() + 15*60);
                            $call->save(false);
                            Call::addOutcall(0, $call->type_id, 0,
                                $call->phone_id, $date, $nextAttempt);
                            break;
                        case '2':
                        case '3':
                            $date = date('Y-m-d H:i',time() + 6*3600);
                            $call->save(false);
                            Call::addOutcall(0, $call->type_id, 0,
                                $call->phone_id, $date, $nextAttempt);
                            break;
                        case '4':
                            $date = date('Y-m-d H:i',time() + 24*3600);
                            $call->save(false);
                            Call::addOutcall(0, $call->type_id, 0,
                                $call->phone_id, $date, $nextAttempt);
                            break;
                        default:
                            //Установить статус Неконтактный
                            $phone = UserPhone::findOne(['user_phone.id' => $call->phone_id]);
                            $user = User::findOne(['user.id' => $phone->user_id]);
//                            $user->setClientStatus(
//                                UserClientStatus::STATUS_NON_CONTACT,
//                                "Установлен статус НЕКОНТАКТНЫЙ после 5 неудачных попыток дозвона."
//                            );

                    }
                    break;
                case static::CALL_EVENT_OUTGOING_TERMINATED: // Завершение звонка
                    break;

                case static::CALL_EVENT_CLOSE_CALL: // Удалена супервайзером
                    Yii::$app->websockets->pushMessage("callcenter",$this->call_id, 0, 'remove_outcall');
                    break;

                case static::CALL_EVENT_MAKE_OUTCALL:
                    break;
                case static::CALL_EVENT_INCALL_REJECTED: // ненормальное завершение звонка
                    break;
                case static::CALL_EVENT_FINISH: // завершение звонка АТС
                    break;

                case 50:
                    // Создаем звонок в указанное время
                    Call::addOutcall(0, $call->type_id, 0,
                        $call->phone_id, $this->data,2/*,++$call->attempt*/);
                    break;
                case 51:
                    // Создаем звонок через неделю
                    $date = date('Y-m-d +7 day',time()).' 09:00:00';
                    Call::addOutcall(0, $call->type_id, 0,
                        $call->phone_id, $date,2/*,++$call->attempt*/);
                    $call->attempt++;
                    $call->save(false);
                    $this->comment = "Запланирован звонок через неделю.";
                    break;
                case 52:
                    // Создаем звонок на послезавтра
                    $date = date('Y-m-d +2 day',time()).' 09:00:00';
                    Call::addOutcall(0, $call->type_id, 0,
                        $call->phone_id, $date,2/*,++$call->attempt*/);
                    $this->comment = "Запланирован звонок на послезавтра.";
                    break;
                case 53:
                    // Создаем звонок на завтра
                    $date = date('Y-m-d +1 day',time()).' 09:00:00';
                    Call::addOutcall(0, $call->type_id, 0,
                        $call->phone_id, $date,2/*,++$call->attempt*/);
                    $this->comment = "Запланирован звонок на завтра.";
                    break;
                case 54:
                    // Создаем звонок через час
                    $date = date('Y-m-d H:i:s',time() + 3600);
                    Call::addOutcall(0, $call->type_id, 0,
                        $call->phone_id, $date,2/*,++$call->attempt*/);
                    $this->comment = "Запланирован звонок через час.";
                    break;
                case 55:
                    // Создаем звонок через 15 минут
                    $date = date('Y-m-d H:i:s',time() + 900);
                    Call::addOutcall(0, $call->type_id, 0,
                        $call->phone_id, $date,2/*,++$call->attempt*/);
                    $this->comment = "Запланирован звонок через 15 минут.";
                    break;
                case 63:
                    // Чужой номер
                    break;
                case 64:
                    // Неправильно набран номер
                    break;


                default:
                    if ($this->event_id>500) {

                    }
                    break;
            }

        } else {  // Входящие звонки
            switch ($this->event_id) {
            }
        }

        // Все звонки
        switch ($this->event_id) {
            case 104: // ПРАЙСЛИСТ  по СМС
//                $this->comment = 'Ссылка на каталог отправлена по СМС';
//
//                if($this->phoneId > 0){
//                    $phoneId = $this->phoneId;
//                }else{
//                    $phoneId = $call->phone_id;
//                }
//
//                $phone =  Phone::findOne($phoneId);
//                $user = User::findInfo()->where(['user.id' => $phone->uid])->one();
//                $phone->sendSms("Ссылка на  актуальный каталог ".
//                    UserLink::createGetCatalogPricelist($user->id, $user->corporateType).' '.
//                    "\nС уважением, команда All-iN-BOX.");
                break;
            case 105: // ПРАЙСЛИСТ  по EMAIL

//                if($this->phoneId > 0){
//                    $emailId = $this->phoneId;
//                }else{
//                    $emailId = false;
//                }
//                $phone =  Phone::findOne($call->phone_id);
//                $user = User::findInfo()->where(['user.id' => $phone->uid])->one();
//                $pricelist = CatalogPricelist::find()->where(['id' => [$user->corporateType, 0]])->orderBy('id DESC')->all();
//                $result = $pricelist[0]->sendByEmail($user->id, false, $emailId);
//                if(isset($result['planned']) && $result['planned']>0){
//                    $this->comment = 'Католог отправлен по Email';
//                }else{
//                    $this->comment = 'Католог НЕ отправлен по Email';
//                }
                break;
        }

        return parent::beforeSave($insert); // TODO: Change the autogenerated stub

    }



    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'call_log';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['call_id', 'event_id','oid' ], 'integer'],
            [['data'], 'string', 'max' => 255],
            [['comment'], 'string', 'max' => 255],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id'        => Yii::t('common', 'ID'),
            'call_id'   => Yii::t('common', 'Call ID'),
            'oid'       => Yii::t('common', 'Operator ID'),
            'event_id'  => Yii::t('common', 'Event ID'),
            'data'      => Yii::t('common', 'Data'),
            'comment'   => Yii::t('common', 'Comment'),
            'created'   => Yii::t('common', 'Created'),
        ];
    }

}
