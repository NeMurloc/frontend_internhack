import { useState } from 'react';
import cl from './ButtonsForMap.module.css';
import geoJsonStore from '../../../store/geojsonStore';
import { observer } from 'mobx-react-lite';
import { notification } from 'antd';

const ButtonsForMap: React.FC = observer(() => {

    const handleClickGiveTracks = () => {
        if (geoJsonStore.selectedStage) {
            geoJsonStore.setTrackVisibility(true);
        } else {
            notification.warning({
                message: 'Предупреждение',
                description: 'Сначала выберите этап',
                placement: 'top',
                duration: 3
              });
        }
    };

    return (
        <div className={cl.container}>
            {!geoJsonStore.trackIsVisible
                ?
                <div className={`${cl.button} ${cl.blueButton}`} onClick={handleClickGiveTracks}>
                    Даешь дорожки!
                </div>
                :
                <>
                    {/* <div className={`${cl.button} ${cl.blueButton}`}>
                        Сохранить
                    </div> */}

                    {/* <div className={`${cl.button} ${cl.grayButton}`} onClick={handleClear}>
                        Очистить
                    </div> */}
                </>
            }
        </div>
    );
})

export default ButtonsForMap;
