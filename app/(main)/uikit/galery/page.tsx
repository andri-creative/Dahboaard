/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Image from 'next/image';
import { Dialog } from 'primereact/dialog';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { Toolbar } from 'primereact/toolbar';
import EditData from './components/edit';
import AddInput from './components/add';
import { Toast } from 'primereact/toast';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { supabase } from '@/DB/supabase';

export default function page() {
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const [checkboxValue, setCheckboxValue] = useState<string[]>([]);
    const [displayNewForm, setDisplayNewForm] = useState(false);
    const [displayEditData, setDisplayEditData] = useState(false);
    const [displayListData, setDisplayListData] = useState(true);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState<any>(null);
    const [isSingleCheckboxChecked, setIsSingleCheckboxChecked] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [galleryData, setGalleryData] = useState<any[]>([]);
    const [displayConfirmation, setDisplayConfirmation] = useState(false);
    const [deletedGalery, setDeletedGalery] = useState(null);
    const [selectedIdGalery, setSelectedIdGalery] = useState<string | null>(null);
    const toast = useRef<Toast>(null);
    const message = useRef<Messages>(null);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDeta, setCurrentDate] = useState('');

    type GalleryItem = {
        id: number;
        id_Galery: string;
        title: string;
        content: string;
        img_url: string;
        categor: string;
        createdAt: string;
        updatedAt: string;
    };

    const addSuccessMessage = () => {
        message.current?.show({ severity: 'success', content: 'Message Detail' });
    };

    const showSuccess = () => {
        toast.current?.show({
            severity: 'success',
            summary: 'Success Message',
            detail: 'Message Detail',
            life: 3000
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/galery');
                const data = await response.json();
                setGalleryData(data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setIsCheckboxChecked(checkboxValue.length > 0);
        setIsSingleCheckboxChecked(checkboxValue.length === 1);
    }, [checkboxValue]);

    const handleCheckAll = (e: CheckboxChangeEvent) => {
        const { checked } = e.target;
        if (checked) {
            const allValues = galleryData.map((item) => item.id);
            setCheckboxValue(allValues);
        } else {
            setCheckboxValue([]);
        }
    };

    const onCheckboxChange = (e: CheckboxChangeEvent, itemId: string) => {
        const { checked } = e.target;
        let selectedValue = [...checkboxValue];
        if (checked) {
            selectedValue.push(itemId);
        } else {
            selectedValue = selectedValue.filter((item) => item !== itemId);
        }
        setCheckboxValue(selectedValue);

        if (checked) {
            setSelectedIdGalery(itemId);
        } else {
            setSelectedIdGalery((prevId) => (prevId === itemId ? null : prevId || null));
        }
    };

    const deletePhotoFromStorage = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from('Galery').remove([path]);

            if (error) {
                throw error;
            }

            console.log('Foto berhasil dihapus dari storage:', path);
        } catch (error) {
            console.error('Error saat menghapus foto dari storage:');
        }
    };

    const handleDelete = async (id: number, path: string) => {
        try {
            await deletePhotoFromStorage(path);

            const { error } = await supabase.from('Galerys').delete().eq('id', path);

            if (error) {
                throw error;
            }

            const newData = galleryData.filter((item) => item.id !== id);
            setGalleryData(newData);
            setCheckboxValue([]);
            setDisplayConfirmation(false);

            toast.current?.show({
                severity: 'success',
                summary: id,
                detail: 'Gallery item deleted successfully',
                life: id
            });
        } catch (error) {
            console.error('Error deleting gallery item:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete gallery item',
                life: 3000
            });
        }
    };

    const confirmationDialogFooter = (
        <>
            <Button type="button" label="No" icon="pi pi-times" onClick={() => setDisplayConfirmation(false)} text />
            <Button type="button" label="Yes" icon="pi pi-check" onClick={() => handleDelete(selectedIdGalery ? parseInt(selectedIdGalery) : 0, selectedIdGalery || '')} text autoFocus />
        </>
    );

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2 flex">
                    <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        disabled={!isSingleCheckboxChecked}
                        severity="help"
                        className=" mr-2"
                        onClick={() => {
                            if (isSingleCheckboxChecked) {
                                const selectedItem = galleryData.find((item) => checkboxValue.includes(item.id));
                                setSelectedItemForEdit(selectedItem);
                                setDisplayEditData(true);
                            }
                        }}
                    />
                    <Button label="Delete" icon="pi pi-trash" disabled={!isCheckboxChecked} className="mr-2" severity="danger" onClick={() => setDisplayConfirmation(true)} />
                    <Dialog header="Confirmation" visible={displayConfirmation} onHide={() => setDisplayConfirmation(false)} style={{ width: '350px' }} modal footer={confirmationDialogFooter}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>Are you sure you want to delete item with ID {selectedIdGalery}?</span>
                        </div>
                    </Dialog>
                </div>
            </React.Fragment>
        );
    };

    const filteredData = galleryData && galleryData.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const centerToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="col-12 ">
                    <span className="p-input-icon-right">
                        <InputText type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <i className="pi pi-search" />
                    </span>
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button className="mr-2">
                    <Checkbox
                        inputId="checkAll"
                        name="option"
                        value="all"
                        checked={galleryData && checkboxValue.length === galleryData.length}
                        onChange={handleCheckAll}
                        className="p-checkbox-rounded p-checkbox-lg mr-2 "
                        icon="pi pi-check"
                        style={{ width: '20px', height: '18px' }}
                    />
                    <label htmlFor="checkAll"></label>
                </Button>

                <Button label="New" className="mr-2" icon="pi pi-plus  " severity="success" onClick={() => setDisplayNewForm(true)} />
            </React.Fragment>
        );
    };

    const handleBackButtonClick = () => {
        setDisplayNewForm(false);
        setDisplayEditData(false);
    };

    const sortedData = filteredData && filteredData.sort((a, b) => b.id - a.id);

    return (
        <div className="grid mt-2">
            <div className="card p-fluid w-full">
                <h5 className=" w-full flex justify-content-between">
                    Galley <span className=" rounded-1">{currentTime}</span>
                </h5>
                {/* <p>Current Time: {currentTime}</p> */}
                {!displayNewForm && displayListData && !displayEditData && (
                    <>
                        <Toolbar className="mb-4" left={leftToolbarTemplate} center={centerToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        <div className="flex grid flex-column md:flex-row gap-2 md:gap-4 ">
                            {sortedData &&
                                sortedData.map((item, i) => (
                                    <div key={item.id} className="card p-fluid ">
                                        {/* <span>{item.id}</span> */}
                                        <div className="field-checkbox">
                                            <Checkbox inputId={item.id} name="option" value={item.id} checked={checkboxValue.indexOf(item.id) !== -1} onChange={(e) => onCheckboxChange(e, item.id)} />
                                            <label htmlFor="checkOption1">{item.id_Galery}</label>
                                        </div>
                                        <Image src={item.img_url} width={200} height={100} alt="data foto 1" />
                                        <div className="w-full flex flex-row  gap-2 mt-3">
                                            <div className=" w-full text-base">{item.categor}</div>
                                            <div className=" w-full text-center">{item.title}</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
                {displayNewForm && <AddInput onBackButtonClick={handleBackButtonClick} />}
                {displayEditData && (
                    <EditData
                        item={{
                            id: selectedItemForEdit?.id || '',
                            id_Galery: selectedItemForEdit?.id_Galery || '',
                            title: selectedItemForEdit?.title || '',
                            content: selectedItemForEdit?.content || '',
                            img_url: selectedItemForEdit?.img_url || '',
                            categor: selectedItemForEdit?.categor || ''
                        }}
                        onBackButtonClick={handleBackButtonClick}
                    />
                )}
                <Toast ref={toast} />
            </div>
        </div>
    );
}
