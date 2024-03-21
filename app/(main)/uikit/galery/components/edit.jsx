import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Image from 'next/image';

import { supabase } from '@/DB/supabase';
const CDMURL = 'https://kkpffydweumgewhvxzow.supabase.co/storage/v1/object/public/Galery/';

const EditData = ({ item, onBackButtonClick }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState(item?.content || '');
    const [title, setTitle] = useState(item?.title || '');
    const [newImageFile, setNewImageFile] = useState(null);
    const toast = useRef(null);

    const leftToolbarNew = () => {
        return (
            <React.Fragment>
                <Button label="Back" icon="pi pi-arrow-left" onClick={handleBackButtonClick} />
            </React.Fragment>
        );
    };

    const rightToolbarNew = () => {
        return (
            <React.Fragment>
                <h5>Edit Gallery</h5>
            </React.Fragment>
        );
    };

    const handleBackButtonClick = () => {
        if (onBackButtonClick) {
            onBackButtonClick();
        }
    };

    const onUpload = () => {
        setSelectedFile(event.files[0]);
        setSelectedFile(event.files[0]);
        toast.current?.show({
            severity: 'info',
            summary: 'Success',
            detail: 'File Uploaded',
            life: 3000
        });
    };

    const handleSubmit = async () => {
        try {
            let imgUrl = item.img_url;

            if (newImageFile) {
                const { data: fileData, error: fileError } = await supabase.storage.from('Galery').upload(`${newImageFile.name}`, newImageFile);

                if (fileError) {
                    throw fileError;
                }

                imgUrl = CDMURL.path;
            }

            const { data, error } = await supabase
                .from('Galerys')
                .update({
                    title: title,
                    content: description,
                    img_url: imgUrl,
                    categor: item.categor
                })
                .eq('id', item.id)
                .select();

            if (error) {
                throw error;
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Data Updated Successfully',
                life: 3000
            });

            setTimeout(()=>{
                onBackButtonClick()
                setTimeout(()=>{
                    window.location.reload()
                },20)
            },2000)
        } catch (error) {
            console.error('Error updating data:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update data',
                life: 3000
            });
        }
    };

    return (
        <div className=" p-fluid w-full mt-4">
            <Toolbar left={leftToolbarNew} right={rightToolbarNew}></Toolbar>
            <div className="flex flex-column md:flex-row gap-2 md:gap-4 mt-4">
                <div className="card p-fluid w-full ">
                    <div className="flex flex-column md:flex-row gap-3">
                        <div className="w-full">
                            {/* <p>id:{item.id}</p> */}
                            <div className="field">
                                <label htmlFor="name1">Id Img</label>
                                <InputText id="name1" type="text" value={item.id_Galery} disabled />
                            </div>
                            <div className="field">
                                <label htmlFor="title">Title</label>
                                <InputText id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="field">
                                <label htmlFor="cater">Category</label>
                                <InputText id="cater" type="text" value={item?.categor || ''} disabled />
                            </div>
                            <div className="field">
                                <label htmlFor="address">Diskripsi</label>
                                <InputTextarea id="address" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <div className="w-full">
                            <Toast ref={toast}></Toast>
                            <div className="field">
                                <label htmlFor="address">Images</label>
                                <FileUpload name="demo[]" url="/api/upload" onUpload={onUpload} multiple={false} accept="image/*" maxFileSize={1000000} disabled />
                            </div>

                            <Image src={item?.img_url} width={400} height={200} alt={item?.title} className="p-2" />
                        </div>
                    </div>
                    <Button label="Submit" onClick={handleSubmit}></Button>
                </div>
            </div>
        </div>
    );
};

export default EditData;
