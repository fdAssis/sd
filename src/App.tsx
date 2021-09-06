import "leaflet/dist/leaflet.css";

import React, { FormEvent, useState, useEffect } from "react";
import { MapContainer } from "react-leaflet";
import { Marker, TileLayer } from "react-leaflet";
import Leaflet from "leaflet";
import { v4 as uuidv4 } from "uuid";
import mqtt from 'mqtt';

import { fetchLocalMapBox } from "./app/apiMapBox";
import AsyncSelect from "react-select/async";

import mapPackage from "./imagens/package.svg";
import mapPin from "./imagens/pin.svg";
import CustomPopup from "./component/popup";
import DatePicker from 'react-date-picker';

import "./style/App.css";

const initialPosition = { lat: -5.0214, lng: -44.2685 };

const mapPackageIcon = Leaflet.icon({
  iconUrl: mapPackage,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

const mapPinIcon = Leaflet.icon({
  iconUrl: mapPin,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

interface focoDeMosquito {
  id: string;
  name: string;
  address: string;
  complement: string;
  date: string | null;
  latitude: number;
  longitude: number;
}

type Position = {
  longitude: number;
  latitude: number;
};

function App() {

  

  const [focos, setFocos] = useState<focoDeMosquito[]>([]);
  const [position, setPosition] = useState<Position>({ latitude: 0, longitude: 0 });
  const [inputDate, setDate] = useState<Date | null>(null);


  const [isEditing, setIsEditing] = useState(false);

  const [id, setId] = useState('');
  const [name, setName] = useState("");
  const [complement, setComplement] = useState("");

  const [address, setAddress] = useState<{
    label: string;
    value: string;
  } | null>(null);


  const [location, setLocation] = useState(initialPosition);
  const loadOptions = async (inputValue: any, callback: any) => {
    const response = await fetchLocalMapBox(inputValue);
    let places: any = [];
    if (inputValue.length < 5) return;
    response.features.map((item: any) => {
      return places.push({
        label: item.place_name,
        value: item.place_name,
        hours: item.hours,
        coords: item.center,
        place: item.place_name,
      });
    });

    callback(places);
  };

  const handleChangeSelect = (event: any) => {
    console.log("changed", event);
    setPosition({
      longitude: event.coords[0],
      latitude: event.coords[1],
    });

    setAddress({ label: event.place, value: event.place });

    setLocation({
      lng: event.coords[0],
      lat: event.coords[1],
    });
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    console.log('handleSubmit')

    if (!address || !name || !inputDate) return;

    let temporaryFocos: focoDeMosquito[] = [...focos,]

    const date: string = inputDate.toISOString()

    let focoDeMosquito: focoDeMosquito = {
      id: uuidv4(),
      name,
      address: address?.value || "",
      complement,
      date,
      latitude: location.lat,
      longitude: location.lng,
    }

    if (isEditing) {
      temporaryFocos = makeChange(temporaryFocos, focoDeMosquito);
    }

    setFocos([
      ...temporaryFocos,
      focoDeMosquito,
    ]);

    setId('')
    setName("");
    setAddress(null);
    setComplement("");
    setDate(null);
    setPosition({ latitude: 0, longitude: 0 });
    setIsEditing(false);
  }

  function makeChange(temporaryFocos: focoDeMosquito[], focoDeMosquito: focoDeMosquito) {
    temporaryFocos = temporaryFocos.map(it => {
      if (it.id === id) {
        it.id = id;
        it.name = focoDeMosquito.name;
        it.address = focoDeMosquito.address;
        it.complement = focoDeMosquito.complement;
        it.date = focoDeMosquito.date;
        it.latitude = focoDeMosquito.latitude;
        it.longitude = focoDeMosquito.longitude;
      }
      return it;
    });
    return temporaryFocos;
  }

  async function handleFormReset(event: FormEvent) {
    event.preventDefault();

    setName("");
    setAddress(null);
    setComplement("");
    setDate(null);
    setPosition({ latitude: 0, longitude: 0 });
    setIsEditing(false)
  }

  async function modificarFocoDeMosquito(event: any) {
    event.preventDefault();

    setIsEditing(true)
    let found: focoDeMosquito | any = focos.find(it => it.id === event.target.value);

    if (found.id) {
      setId(found.id);
    }
  }

  async function deletarFocoDeMosquito(event: any) {

    setFocos([
      ...focos.filter(it => it.id !== event.target.value)
    ]);
  }

  useEffect(() => {
    const client = mqtt.connect('mqtt://127.0.0.1:1883');
    var topic = 'teste1883';
    
    client.on('connect', () => {
      setImmediate(() => {
        client.publish(topic, JSON.stringify(position));
        console.log('Messagem enviada!', JSON.stringify(position));
      });
    });
  },[position])

  return (
    <div id="page-map">
      <main>
        <form onSubmit={handleSubmit} onReset={handleFormReset} className="landing-page-form">
          <fieldset>
            {isEditing ? <legend>Alteração Dados</legend> : <legend>Entregas</legend>}

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                placeholder="Digite seu nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="address">Endereço</label>
              <AsyncSelect
                placeholder="Digite seu endereço..."
                classNamePrefix="filter"
                cacheOptions
                loadOptions={loadOptions}
                onChange={handleChangeSelect}
                value={address}
              />
            </div>

            <div className="input-block">
              <label htmlFor="complement">Complemento</label>
              <input
                placeholder="Apto / Nr / Casa..."
                id="complement"
                value={complement}
                onChange={(event) => setComplement(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="hours">Dia da Visita</label>

              <DatePicker
                onChange={(event: any) => setDate(new Date(event.toISOString()))}
                value={inputDate === null ? null : new Date(inputDate)}
                format={"dd-MM-yyyy"}

              />

            </div>

          </fieldset>

          <button className="confirm-button" type="submit" value="Submit">{isEditing ? "Confirmar Alteração" : "Confirmar"}</button>
          <button className="confirm-reset" type="reset" value="Reset">{isEditing ? "Cancelar Alteração" : "Limpar"}</button>
        </form>

      </main>

      <MapContainer
        center={location}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        {/* <TileLayer url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_ACCESS_TOKEN_MAP_BOX}`}
        />

        {position && (
          <Marker
            icon={mapPinIcon}
            position={[position.latitude, position.longitude]}
          ></Marker>
        )}

        {focos.map((focoDeMosquito) => (
          <Marker
            key={focoDeMosquito.id}
            icon={mapPackageIcon}
            position={[focoDeMosquito.latitude, focoDeMosquito.longitude]}
          >
            <CustomPopup
              focoDeMosquito={focoDeMosquito}
              modificarFocoDeMosquito={modificarFocoDeMosquito}
              deletarFocoDeMosquito={deletarFocoDeMosquito}
            />
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
