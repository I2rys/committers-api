"use strict";

// Dependencies
const request = require("request-async")
const { JSDOM } = require("jsdom")
const express = require("express")
const _ = require("lodash")

// Variables
const web = express()
const port = process.env.PORT || 8080

// Main
web.get("/", async(req, res)=>{
    const { country } = req.query

    const response = await request(`https://committers.top/${country.toLowerCase()}`)
    if(response.body.match("Page not found &")) return res.json({
        status: "failed",
        message: "Invalid or unsupported country."
    })
    const dom = new JSDOM(response.body)
    const data = []
    const ranks = dom.window.document.querySelectorAll("td:nth-child(1)")
    const usernames = dom.window.document.querySelectorAll("td:nth-child(2)")
    const contributions = dom.window.document.querySelectorAll("td:nth-child(3)")
    const pfps = dom.window.document.querySelectorAll("td:nth-child(4) > img")

    try{
        for( const i in ranks ) if(ranks[i].textContent && !_.find(data, { rank: ranks[i].textContent.replace(".", "") })) data.push({
            rank: +ranks[i].textContent.replace(".", ""),
            name: usernames[i].textContent.split("(")[1].replace(")", ""),
            username: usernames[i].textContent.split("(")[0],
            contribution: +contributions[i].textContent,
            pfp: pfps[i].getAttribute("data-src"),
            github: `https://github.com/${usernames[i].textContent.split("(")[0]}`
        })
    }catch{}

    res.json({
        status: "success",
        data: data
    })
})

web.use("*", (req, res)=>res.redirect("https://cspi.network/")) // You can delete if you want. :D
web.listen(port, ()=>console.log(`Server is running. Port: ${port}`))