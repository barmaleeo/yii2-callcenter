<?php

namespace barmaleeo\callcenter\models;

use Yii;

/**
 * This is the model class for table "call_type".
 *
 * @property int $id
 * @property int $direction
 * @property string $name
 * @property string $desc
 * @property int $script_id
 * @property string $created
 * @property string $updated
 */
class CallType extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'call_type';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['direction', 'script_id'], 'integer'],
            [['created', 'updated'], 'safe'],
            [['name'], 'string', 'max' => 50],
            [['desc'], 'string', 'max' => 255],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => Yii::t('common', 'ID'),
            'direction' => Yii::t('common', 'Direction'),
            'name' => Yii::t('common', 'Name'),
            'desc' => Yii::t('common', 'Desc'),
            'script_id' => Yii::t('common', 'Script ID'),
            'created' => Yii::t('common', 'Created'),
            'updated' => Yii::t('common', 'Updated'),
        ];
    }
}
