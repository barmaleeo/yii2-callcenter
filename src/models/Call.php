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
            'id' => Yii::t('common', 'ID'),
            'type_id' => Yii::t('common', 'Type ID'),
            'phone_id' => Yii::t('common', 'Phone ID'),
            'status_id' => Yii::t('common', 'Status ID'),
            'op_id' => Yii::t('common', 'Op ID'),
            'goal' => Yii::t('common', 'Goal'),
            'enable_time' => Yii::t('common', 'Enable Time'),
            'start_time' => Yii::t('common', 'Start Time'),
            'end_time' => Yii::t('common', 'End Time'),
            'created' => Yii::t('common', 'Created'),
            'updated' => Yii::t('common', 'Updated'),
        ];
    }
}
