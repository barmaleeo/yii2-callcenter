<?php

namespace barmaleeo\callcenter\models;

use Yii;

/**
 * This is the model class for table "call".
 *
 * @property int $id
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
    const STATUS_READY  = 0;


    const DIRECTION_UNCALL  = 0;
    const DIRECTION_OUTCALL = 1;

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
            [['type_id', 'phone_id', 'status_id', 'op_id', 'goal'], 'integer'],
            [['enable_time', 'start_time', 'end_time', 'created', 'updated'], 'safe'],
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
            ])
            ->leftJoin('user_phone','user_phone.id=call.phone_id')
            ->leftJoin('user','user.id=user_phone.user_id')
            ->groupBy('call.id');
    }
}
