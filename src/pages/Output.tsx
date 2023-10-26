import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from '../socket.ts';
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import './output.css'

export default function Output({ setTitle, config, setConfig }: { setTitle: (title: string) => void, config: Config | null, setConfig: (config: Config) => void }) {
  const { device, outputId } = useParams();
  const [outputData, setOutputData] = useState<OutputConfig>();
  const [name, setName] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [defaultVolume, setDefaultVolume] = useState<number>(50);
  const navigate = useNavigate();
  const [backBtnElement, setBackBtnElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    socket && socket.on("message", (newMessage: ConfigMessage) => {
      if (newMessage.status === "configEdited") {
        setConfig(newMessage.config);
        navigate('/')
      }
    });
    setBackBtnElement(document.getElementById('backBtn') as HTMLElement)
  }, [setConfig, navigate]);

  useEffect(() => {
    if (config) {
      setOutputData(config.devices[device ?? 0]?.outputs[outputId ?? 0])
      setTitle(outputData?.name ?? `Output ${outputId}`);
      setName(outputData?.name ?? '');
      setImage(outputData?.image ?? '');
      setDefaultVolume(outputData?.defaultVolume ?? 50);
    }
  }, [config, device, outputData?.defaultVolume, outputData?.image, outputData?.name, outputId, setTitle]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImage(e.target.value);
  };
  const handleDefaultVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultVolume(parseInt(e.target.value) || 0);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket && socket.emit("message", { action: "editOutput", device, output: outputId, name, image, defaultVolume });
  }

  return (
    <>
      {backBtnElement && createPortal(<Link to={'/'} className="backBtn bg-slate-100 rounded-full px-2 mr-2">
          <ChevronLeftIcon className="h-5 w-5 text-gray-500 align-baseline inline-block" />
        </Link>, backBtnElement)}
      <div className="plant mb-4 mx-4 p-4 sm:mx-0">
        <form onSubmit={handleSubmit} className="output-form sm:flex sm:items-center">
          <div className="sm:w-2/3">
            <input className="" type="text" placeholder="Name" value={name} onChange={handleNameChange} />
            <div className="flex items-center mb-4">
              <input className="volume" type="number"  value={defaultVolume} onChange={handleDefaultVolumeChange} />
              <span className="volume-label">ml</span>
            </div>
            <select onChange={handleImageChange} value={image} >
              <option value="">Select image</option>
              {[...Array(7)].map((_, i) => <option key={i} value={`0${i + 1}.jpg`}>Image {i + 1}</option>)}
            </select>
            <div className="text-right mb-4">
              <button type="submit" className="saveBtn">Save</button>
            </div>
          </div>
          <div className="w-full h-72 sm:w-1/3 sm:ml-4">
            <img src={`/plants/${image}`} className="image h-72" alt="" />
          </div>
        </form>
      </div>
    </>
  )
}