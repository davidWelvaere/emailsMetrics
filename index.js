require('dotenv').config()
const axios = require('axios')
const { google } = require('googleapis')
const sheets = google.sheets('v4')

async function clearSheet() {
    await sheets.spreadsheets.values.clear({
        spreadsheetId: '1x5y92OVK665uccZ-QV3XoFuVMfhMHKI33G1wuUleaRw',
        range: 'Emails!A2:Z'
    })
}

async function putSpreadsheetsData(hubspotData) {
    await clearSheet()
}

async function authenticateSpreadsheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'valiant-vault-434809-u7-60937a79977e.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    const authclient = await auth.getClient()
    google.options({ auth: authclient })
}

async function getHubspotData() {
    const hubspotKey = process.env.HUBSPOT_KEY
    const baseurl = 'https://api.hubapi.com'
    const aggrStats = '/marketing/v3/emails'
    const now = new Date().toISOString()
    const params = `?createdAfter=2025-01-01&includeStats=true`
    const fullurl = baseurl + aggrStats + params
    console.log(`fullurl:\n${fullurl}`)

    const response = await axios.get(fullurl, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hubspotKey}`
        }
    })

    const filtered = response.data.results.filter(
        res => 'stats' in res && 'ratios' in res.stats && res.name.includes('NWS')
    )

    return filtered
}

async function main() {
    await authenticateSpreadsheets()
    const hubspotData = await getHubspotData()
    await putSpreadsheetsData(hubspotData)

}

main().catch(e => console.error(e))

