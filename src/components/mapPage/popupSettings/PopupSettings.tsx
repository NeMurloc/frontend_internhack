import cl from './PopupSettings.module.css'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import geoJsonStore from '../../../store/geojsonStore';
import { GeoJSON } from "geojson";
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';

interface NamedGeoJsonObject extends GeoJSON.GeoJsonObject {
    name: string;
}

const PopupSettings: React.FC = observer(() => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [folderName, setFolderName] = useState<string>('');
    const popupRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [stages, setStages] = useState<string[]>([]);

    useEffect(() => {
        const dispose = reaction(
            () => geoJsonStore.files,
            (files) => {
                const stageNames: Set<string> = new Set();
                files.forEach((file) => {
                    const geoJson = file.content as NamedGeoJsonObject;
                    if (geoJson.name) {
                        const stageName = geoJson.name.split('&')[0];
                        stageNames.add(stageName);
                    }
                });
                setStages(Array.from(stageNames));
            }
        );

        return () => {
            dispose();
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFilesUploadWhithoutBackend = async () => {
        try {
            setFolderName('Название загруженной папки')
            const fileNames = ['ТестДороги.geojson', 'ТестЗдания.geojson', 'ТестДороги2.geojson', 'ТестЗдания2.geojson']; // Добавьте все имена файлов

            // Это пути для localhost
            // const promises = fileNames.map(async (fileName) => {
            //     const response = await fetch(`/testBackendGeojson/${fileName}`);
            //     const geoJsonData = await response.json();

            //     geoJsonStore.addFile(fileName, geoJsonData); // Сохранение в MobX с указанием имени файла и данных
            // });

            const promises = fileNames.map(async (fileName) => {                
                const response = await fetch(`${process.env.PUBLIC_URL}/testBackendGeojson/${fileName}`);

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки файла: ${fileName}`);
                }

                const geoJsonData = await response.json();
                geoJsonStore.addFile(fileName, geoJsonData);
            });

            await Promise.all(promises);

            console.log('Файлы успешно добавлены в MobX Store');
        } catch (error) {
            console.error('Ошибка при загрузке файлов:', error);
        }
    }

    const handleFilesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (files) {
            const folder = event.target.files?.[0]?.webkitRelativePath.split('/')[0];
            if (folder) {
                setFolderName(folder);
            }

            const shpFiles: File[] = [];
            const shxFiles: File[] = [];
            const dbfFiles: File[] = [];
            const prjFiles: File[] = [];
            const cpgFiles: File[] = [];

            Array.from(files).forEach((file) => {
                const fileExtension = file.name.split('.').pop()?.toLowerCase();

                switch (fileExtension) {
                    case 'shp':
                        shpFiles.push(file);
                        break;
                    case 'shx':
                        shxFiles.push(file);
                        break;
                    case 'dbf':
                        dbfFiles.push(file);
                        break;
                    case 'prj':
                        prjFiles.push(file);
                        break;
                    case 'cpg':
                        cpgFiles.push(file);
                        break;
                    default:
                        break;
                }
            });

            const formData = new FormData();
            shpFiles.forEach((file, index) => formData.append(`shpFiles[${index}]`, file));
            shxFiles.forEach((file, index) => formData.append(`shxFiles[${index}]`, file));
            dbfFiles.forEach((file, index) => formData.append(`dbfFiles[${index}]`, file));
            prjFiles.forEach((file, index) => formData.append(`prjFiles[${index}]`, file));
            cpgFiles.forEach((file, index) => formData.append(`cpgFiles[${index}]`, file));

            try {
                const response = await axios.post('/your-backend-endpoint', formData);

                if (response.status === 200) {
                    const geoJsonFiles = response.data;

                    // Преобразуем каждый файл из ответа в формат GeoJSON и добавляем в хранилище
                    geoJsonFiles.forEach((file: { name: string; content: GeoJSON.GeoJsonObject }) => {
                        geoJsonStore.addFile(file.name, file.content);
                    });
                    console.log('Файлы успешно загружены');
                } else {
                    console.error('Ошибка при загрузке файлов:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при загрузке файлов:', error);
            }
        }
    };

    const handleStageSelect = (stage: string) => {

        geoJsonStore.setSelectedStage(stage);
    };

    const handleResetProject = () => {
        geoJsonStore.resetProject();
        setFolderName('');
        setIsOpen(false);
    };

    const sortedStages = stages
        .map((stage) => parseInt(stage, 10))
        .sort((a, b) => a - b)
        .map((stage) => stage.toString());

    return (
        <>
            <div ref={popupRef} className={`${cl.popupContainer} ${isOpen ? '' : cl.popupContainerClosed}`}>
                <div className={cl.title}>Проект</div>


                <div className={cl.uploadFilesContainer}>
                    {folderName ? (
                        <div className={cl.folderName}>
                            Папка: {folderName}
                        </div>
                    ) : (
                        <>
                            <div
                                className={cl.uploadFiles}
                                // onClick={() => fileInputRef.current?.click()}
                                onClick={handleFilesUploadWhithoutBackend}
                            >
                                Загрузить файлы
                            </div>

                            {/* <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                webkitdirectory="true"
                                multiple
                                onChange={handleFilesUpload}
                            /> */}
                        </>
                    )}
                </div>


                {folderName &&
                    <>
                        <div className={cl.version}>
                            <div className={cl.versionTilte}>Версия</div>
                            {sortedStages.map((stage) => (
                                <div
                                    key={stage}
                                    className={`${cl.versionButton} ${geoJsonStore.selectedStage === stage ? cl.selectedStage : ""}`}
                                    onClick={() => handleStageSelect(stage)}
                                >
                                    {stage} - очередь
                                </div>
                            ))}
                        </div>

                        <div className={cl.resetProjectContainer}>
                            <div className={cl.resetProjectButton} onClick={handleResetProject}>
                                Сбросить проект
                            </div>
                        </div>
                    </>
                }
            </div>

            <div
                className={cl.openPopup}
                onClick={() => { setIsOpen(true); }}
            >
                Проект
            </div>
        </>
    );
})

export default PopupSettings;