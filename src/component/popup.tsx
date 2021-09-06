import "leaflet/dist/leaflet.css";

import React from "react";
import { Popup } from "react-leaflet";
import PropTypes from 'prop-types';
import moment from 'moment'
import "../style/App.css";
function CustomPopup(props: any) {


    const date = moment(props.focoDeMosquito.date)
    
    return (
        <Popup
            closeButton={false}
            minWidth={240}
            maxWidth={240}
            className="map-popup"
        >
            <div>
                <h3>{props.focoDeMosquito.name}</h3>

                <h4>{'Endereço:'}</h4>
                <p>{props.focoDeMosquito.address} - {props.focoDeMosquito.complement} </p>
                <h4>{'Data de Visita:'}</h4>
                <p>{date.format("MMM Do YY")}</p>


                <span style={{ color: '#0089A5', lineHeight: '24px', textDecoration: 'none' }}>
                    <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${props.focoDeMosquito.latitude},${props.focoDeMosquito.longitude}`}>Ver rotas no Google Maps</a>
                </span>

                <button name='edit' className="edit-button" value={props.focoDeMosquito.id} onClick={props.modificarFocoDeMosquito} >Editar</button>
                <button name='delete' className="delete-button" value={props.focoDeMosquito.id} onClick={props.deletarfocoDeMosquito} >Excluir</button>


            </div>
        </Popup>
    )
}

CustomPopup.propTypes = {
    modificarFocoDeMosquito: PropTypes.func,
    deletarFocoDeMosquito: PropTypes.func,
    focoDeMosquito: PropTypes.shape({
        name: PropTypes.string.isRequired,
        complement: PropTypes.string
    })
};

export default CustomPopup;