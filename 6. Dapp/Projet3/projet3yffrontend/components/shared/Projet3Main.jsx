'use client';
import { useState, useEffect } from "react";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const Projet3Main = () => {
    return (
        <>
            <p>Accueil</p>
            <div className="flex">
                <Input placeholder="Votre adresse" onChange={(e) => setNumber(e.target.value)} />
                <Button variant="outline">
                    Ajout Adresse</Button>
            </div>
            <div className="flex">
                <Button variant="outline">
                    Commencer l'enregistrement des propositions</Button>
            </div>
            <div className="flex">
                <Input placeholder="Votre proposition" onChange={(e) => setNumber(e.target.value)} />
                <Button variant="outline">
                    Enregistrer une proposition</Button>
            </div>
            <div>
                <Button variant="outline">
                    Mettre fin à l'enregistrement des propositions</Button>
            </div>
            <div className="flex">
                <Button variant="outline">
                    Commencer la session de vote</Button>
            </div>
            <div className="flex">
                <Input placeholder="Id de la proposition" onChange={(e) => setNumber(e.target.value)} />
                <Button variant="outline">
                    Voter</Button>
            </div>
            <div>
                <Button variant="outline">
                    Mettre fin à la session de vote</Button>
            </div>
            <div>
                <Button variant="outline">
                    Compter les votes</Button>
            </div>
            <div>
                <Button variant="outline">
                    Afficher le résultat</Button>
            </div>
        </>
    )
}

export default Projet3Main;