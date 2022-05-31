import React from 'react'
import bomb from '../static/img/bomb.png'

const Loading = () => {
    return (
        <main id='loader'>
            <div className='loading'>
                <img src={bomb} alt="bomb" data-color='red' />
                <img src={bomb} alt="bomb" data-color='gold' />
                <img src={bomb} alt="bomb" data-color='green' />
            </div>
        </main>
    )
}

export default Loading
