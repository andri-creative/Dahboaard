import Image from 'next/image';
import React from 'react';

const Profiles = () => {
    return (
        <div className="grid mt-2">
            <div className="card p-fluid w-full">
                <h5>Profiles</h5>
                <div className="flex gap-2">
                    <div className=" flex-auto p-2 w-1/4 ">
                        <div className=" w-100 d-flex justify-content-center align-content-center ">
                            <Image src={'https://bootdey.com/img/Content/avatar/avatar7.png'} className="w" width={100} height={100} alt="user" />
                        </div>
                    </div>
                    <div className="flex-auto w-3/4  p-2 bg-red-300">
                        <h1>Johen Antagistamen</h1>
                        <p>Full Stack</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profiles;
