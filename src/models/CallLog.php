<?php

namespace barmaleeo\callcenter\models;

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
    const CALL_EVENT_NO_ANSWER              = 4; // no_answer
    const CALL_EVENT_RINGING                = 7;
    const CALL_EVENT_SELECT_CLIENT          = 8; // выбран клиент - DEPRECATED
    const CALL_EVENT_PRESS_ACCEPT           = 9; // 
    const CALL_EVENT_ACCEPTED               = 10;
    const CALL_EVENT_BYE                    = 13;
    const CALL_EVENT_PRESS_CANCEL           = 14; //
    const CALL_EVENT_CLOSE_CALL             = 15; // Закрыт оператором
    const CALL_EVENT_MUTED                  = 17;
    const CALL_EVENT_UNMUTED                = 18;
    const CALL_EVENT_START_VOICEMAIL        = 19;
    //const CALL_EVENT_RINGING                = 0;
    const CALL_EVENT_OUTGOING_TERMINATED    = 301;
    const CALL_EVENT_INCALL_REJECTED        = 302;
    const CALL_EVENT_FINISH                 = 307;
    const CALL_EVENT_END_VOICEMAIL          = 308;





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
            [['call_id', 'event_id',' oid' ], 'integer'],
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
            'event_id'  => Yii::t('common', 'Event ID'),
            'data'      => Yii::t('common', 'Data'),
            'comment'   => Yii::t('common', 'Comment'),
            'created'   => Yii::t('common', 'Created'),
        ];
    }
}
