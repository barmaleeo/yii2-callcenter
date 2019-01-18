<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 2019-01-17
 * Time: 17:49
 */

?>
<div id="yii2-callcenter-root">
    <div class="cc-outher">
        <div class="c-o-left">

            <div class="cc-scripts-outher">
                <div id="callcenter-script-body" class="cc-script">
                <?= $content ?>
                </div>
            </div>
            <div class="cc-client-outher"></div>
            <div class="cc-wiki-outher">
                <div class="wiki-outher">
                    <button class="btn btn-sm btn-default">Вопросы</button>
                    <button class="btn btn-sm btn-default">Как проехать</button>
                    <button class="btn btn-sm btn-default">Адреса</button>
                    <button class="btn btn-sm btn-default">Реквизиты</button>
                    <button class="btn btn-sm btn-default">Прайслист</button>
                    <button class="btn btn-sm btn-default">Презентации</button>
                </div>
            </div>
        </div>
        <div class="c-o-right">
            <div class="cc-phone-outher">
                <div class="p-o-block-wrapper p-o-logo">
                    <div class="o-l-lines">0</div>
                    <div class="o-l-img" style="background-color: white;"><img class="yii2-callcenter-logo"
                                                                               src="/img/frontend/logo_full.png"></div>
                    <div class="o-l-power green"><span class="glyphicon glyphicon-off"></span></div>
                </div>
                <div class="p-o-block-wrapper p-o-number">
                    <div class="o-n-lights">
                        <div class="n-lighs-ws"></div>
                        <div class="n-lighs-sip green"></div>
                        <div class="n-lighs-query"
                             title="Система работает нормально. Запросы к серверу выполняются без ошибок."
                             style="background: rgb(0, 128, 0);"></div>
                    </div>
                    <div class="o-n-display"><span class="n-d-full">8888888<span class="d-f-data"></span>88888888</span>
                    </div>
                </div>
                <div class="p-o-block-wrapper p-o-buttons">
                    <button class="btn btn-xl btn-danger" disabled=""><span
                                class="glyphicon glyphicon-phone-alt"></span></button>
                    <button class="btn btn-xl btn-success" disabled=""><span
                                class="glyphicon glyphicon-earphone"></span></button>
                </div>
                <div class="p-o-block-wrapper p-o-transfer">
                    <select class="form-control">
                        <option>888888888</option>
                        <option>777777777</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>