# import spellchecker
# from spellchecker import SpellChecker
import re
from string import whitespace
#from SimpleAnonymizer import AnonymizeWord, SetAnonFlag
from typing import List


class Serializable:
    def serialize(self):
        return {}


class TextSegment(Serializable):
    def __init__(self, start: int, end: int, label: str):
        self.start = start
        self.end = end
        self.label = label

    def serialize(self):
        return {
            "start": self.start,
            "end": self.end,
            "label": self.label
        }

# Nicknames are not passed into the call to AnonymizeText
#_nicknames = ['rick', 'ricky', 'richie', 'dick', 'stu', 'elle', 'liz', 'jay', 'kat', 'cat']
_ignore = ['you', 'male', 'female', 'epa', 'e.g.', 'eg', 'i.e.', 'ie']
_overrides = ['who', 'that', 'to', 'then', 'than']
_acronyms = ['epa','stemi']
_badSymbols = ['/', '\\', '#', '$', ':']

"""
Inputs:
Takes a word W

Returns:
Either the word W or an anonymized word

Function:
Works by check to see if W is a known pronoun

@todo The list should not really be hardcoded but should come from some external source?
"""


def AnonymizeWord_Pronoun(W):
    _result = W

    if ((W == "he") or
            (W == "she") or
            (W == "him") or
            (W == "her") or
            (W == "his") or
            (W == "hers") or
            (W == "himself") or
            (W == "herself")):
            #(W == "man") or
            #(W == "woman") or
            #(W == "men") or
            #(W == "women") or
            #(W == "boy") or
            #(W == "girl") or
            #(W == "mother") or
            #(W == "father") or
            #(W == "lady") or
            #(W == "uncle") or
            #(W == "aunt") or
            #(W == "son") or
            #(W == "daughter") or
            #(W == "husband") or
            #(W == "wife"))
        _result = "PRONOUN"

    return _result


"""
Inputs:
    W: A string. The word under consideration.

Returns:
    flag: A boolean. True if this is an acronym.

Function:

@todo The list should not really be hardcoded but should come from some external source?    
"""


def AnonymizeWord_Acronym(W):
    _flag = False

    if W.isupper() and len(W) > 1:
        _flag = True

    return _flag


"""
Inputs:
    W: A string. The word under consideration.

Returns:
    string: "INITIAL" if it detects they are initials  

Function:
"""


def AnonymizeWord_Initials(W, N, Name, FName):
    _result = W

    # if the name starts with the W
    if not N is None:
        if Name.find(N) == 0 and FName.find(W.lower()) == 0 and len(W) == 1:
            _result = "INITIAL"
    elif len(W) == 2:
        first = W[0].lower()
        second = W[1].lower()
        if FName.find(first) == 0 and Name.find(second) == 0:
            _result = "INITIAL"

    return _result


"""
Inputs:
    W: A string. The word under consideration.

Returns:
    flag: A boolean. True if this is an contraction.

Function:

@todo The list should not really be hardcoded but should come from some external source?    
"""


def AnonymizeWord_Contraction(W):
    _flag = False

    if W.find('\'') > 0:
        _flag = True

    return _flag


"""
Inputs:
    W: A string. The word under consideration.

Returns:
    result: A string. Either the original word or the anonymized word

Function:
    Checks to see if the word is a known adjective that needs to be anonymized.
    Currently, this is "male" and "female".

@todo The list should not really be hardcoded but should come from some external source?    
"""
def AnonymizeWord_Adjective(W):
    _result = W

    if ((W == "male") or
            (W == "female")):
        _result = "ADJECTIVE"

    return _result


"""
Inputs:
    W: A string. The word under consideration.

Returns:
    result: A string. Either the original word or the anonymized word

Function:
    Checks to see if the word is a known abbreviation.
    Currently, this is "m" (for male) and "f" (for female). However, other abbreviations may be added.

@todo The list should not really be hardcoded but should come from some external source?    
"""


def AnonymizeWord_Abbreviations(W):
    _result = W

#DISABLED BY POPULAR DEMAND
#    if ((W == "m") or
#        (W == "f")):
#        _result = "FLAGGED"

    return _result


"""
Inputs:
    W: The word under consideration
    Name: A name of a person associated to the EPA record. Usually this will be either the resident or observer
    Note the name could be the first, last, or middle name

Returns:
    result: Either the original word W or the anonymized word

Function:
    Simply checks to see if the word is exactly the same as the first name or last name
"""


def AnonymizeWord_Name(W, Name):
    _result = W

    if W == Name:
        _result = "NAME"

    return _result


"""
Inputs:
    W: The word under consideration
    Name: A name of a person associated to the EPA record. Usually this will be either the resident or observer
    Note the name could be the first, last, or middle name

Returns:
    result: Either the original word W or the anonymized word

Function:
    Checks to see if the name is a known nickname stored in the global variable _nicknames (this was a property in the Java version)
    @todo Currently, this is a hardcoded list but it really should come from an external source
    @todo Also,it might be necessary to have nickname associated to a name. E.g., Ricky associated to Richard 
"""


def AnonymizeWord_NickName(W, Name, Nicknames):
    _result = W

    if Name in Nicknames:
        _list = Nicknames[Name]
        found = False
        index = 0
        while (index < len(_list)) and (not found):
            if (W == _list[index].lower()):
                _result = "NICKNAME"
                found = True
            index = index + 1

    return _result


"""
Inputs:
    W: A string. This is the word under consideration.
    Name: A string. This can be a first or last name.

Returns:
    result: A string. This is either the original word or the anonymized word

Functions:
    This function attempts to determine if a word is a nickname (or name) by applying a series of logical rules
    Each of the rules usually will set a flag, and then different combinations of flags are checked at the end.

    @todo We need a spellchecker for Python
"""


def AnonymizeWord_NameSubword(W, P, N, Name, FName):
    _result = W
    processing = W  # as the word is modified, this is used to prevent changing the original

    _flagDone = False  # indicates if functioning should terminate
    _flagPrefix = False  # track if the prefix matches a possible name / nickname
    _flagSpelling = False  # tracks if the word is misspelled (currently not working, need a spellchecker)
    _flagNotWord = False  # tracks if the word is not recognized  at all (currently not working, need a spellchecker)
    _flagSuffix = False  # tracks if the  suffix is in general odd
    _flagNotWord = True # tracks if spellchecking think this is a word

    # does the word end in Y, I, K, etc.?
    _flagSuffixY = False
    _flagSuffixI = False
    _flagSuffixK = False
    _flagSuffixH = False
    _flagSuffixIE = False
    _flagSuffixCH = False
    _flagSuffixKY = False
    _flagSuffixHY = False

    # Need a Python based spellchecker to replace this Java code
    # pyspellchecker is too good, it recognizes names properly
    #    spell = SpellChecker()

    # find those words that may be misspelled
    #   misspelled = spell.unknown(['brent'])
    #   for word in misspelled:
    #      print(word + ": " + str(spell.candidates(word)))

    # if the name starts with the W, and W is not a word
    # currently not working, need spellchecker
    #if Name.find(W) == 0 and _flagNotWord:
    #    _result = "NICKNAME?"
    #    _flagPrefix = True
    #    _flagDone = True

    if (not _flagDone):
        # does the word end in y or i or ie
        # if so strip it off
        if processing.endswith("y"):
            _flagSuffixY = True;
            _flagSuffix = True;
            processing = processing[0:len(processing) - 1]
        elif processing.endswith("i"):
            _flagSuffixI = True
            _flagSuffix = True;
            processing = processing[0:len(processing) - 1]
        elif processing.endswith("k"):
            _flagSuffixK = True
            _flagSuffix = True
            processing = processing[0:len(processing) - 1]
        elif processing.endswith("h"):
            _flagSuffixH = True
            _flagSuffix = True
            processing = processing[0:len(processing) - 1]

        # check to see if the original word has the processing string as a prefix
        # if so it is a likely nickname
        if _flagSuffix and Name.startswith(processing) and len(processing) > 1:
            _result = "NICKNAME?"
            _flagPrefix = True

        # if this is not already flagged, then take a look at strange two letter endings
        # reset the processing string
        processing = W
        if not _flagPrefix:
            if processing.endswith("ie"):
                _flagSuffixIE = True
                _flagSuffix = True
                processing = processing[0:len(processing) - 2]
            elif processing.endswith("ch"):
                _flagSuffixCH = True
                _flagSuffix = True
                processing = processing[0:len(processing) - 2]
            elif processing.endswith("ky"):
                _flagSuffixKY = True
                _flagSuffix = True
                processing = processing[0:len(processing) - 2]
            elif processing.endswith("hy"):
                _flagSuffixHY = True
                _flagSuffix = True
                processing = processing[0:len(processing) - 2]

            # if after removing the ending the word matches the name
            if _flagSuffix and Name.startswith(processing) and len(processing) < len(W):
                _result = "NICKNAME?"
                _flagPrefix = True

    # this word has a strange suffix, flag it
    if not _flagPrefix and (_flagSuffixIE or _flagSuffixI or _flagSuffixKY) and len(processing) > 1:
        _result = "FLAGGED"

    # this isn't a word and it has a strange ending
    #if _flagNotWord and _flagSuffix:
    #    _result = "FLAGGED"

    return _result


def AnonymizeWord_FlagOverrides(W):
    _result = True
    _index = 0

    while (_index < len(_overrides)) and _result:
        if (W.lower() == _overrides[_index].lower()):
            _result = False
        _index = _index + 1

    return _result


def AnonymizeWord_Flag(W, F):
    _result = W

    if F and AnonymizeWord_FlagOverrides(W):
        _result = "NAME"

    return _result


def Contains(A, V):
    _index = 0
    _found = False
    while (_index < len(A)) and (not _found):
        if V == _ignore[_index].lower():
            _found = True
        _index = _index + 1

    return _found

"""
DEPRECATED - Replaced with a new version that takes an array of names
Inputs:
    String W: The current word under consideration
    String FirstNameR: The resident's first name
    String LastNameR: The resident's last name
    String FirstNameO: The observer's first name
    String LastNameO: The observer's last name
    Boolean F: A flag that indicates the previous word was unusual

Returns:
    String: the word W or the anonymized word

AnonymizeWord functions by calling several other functions to do the actual work of anonymization.
Think of it as a collection of rules to be applied.
def AnonymizeWord(W, FirstNameR, LastNameR, FirstNameO, LastNameO, F):
    # make sure everything is in lowercase in local copies
    result = W.lower()
    _FirstNameR = FirstNameR.lower();
    _LastNameR = LastNameR.lower();
    _FirstNameO = FirstNameO.lower();
    _LastNameO = LastNameO.lower();

    # for each rule first check to see if the word has already changed, if it is already changed then do not run anymore rules
#    print(result)
    result = AnonymizeWord_Pronoun(result)
#    print(result)

    if (result == W.lower()):
        result = AnonymizeWord_Adjective(result)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_Abbreviations(result)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_Name(result, _FirstNameR, _LastNameR)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_Name(result, _FirstNameO, _LastNameO)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_NickName(result, _FirstNameR, _LastNameR)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_NickName(result, _FirstNameO, _LastNameO)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_NameSubword(result, _FirstNameR)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_NameSubword(result, _LastNameR)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_NameSubword(result, _FirstNameO)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_NameSubword(result, _LastNameO)
        #print(result)

    if (result == W.lower()):
        result = AnonymizeWord_Flag(result, F)
        #print(result)

    return result
"""

"""
Inputs:
    String W: The current word under consideration
    Array[String] Names: The array of names to consider
    Boolean F: A flag that indicates the previous word was unusual

Returns:
    String: the word W or the anonymized word

AnonymizeWord functions by calling several other functions to do the actual work of anonymization.
Think of it as a collection of rules to be applied.
"""
def AnonymizeWord(W, P, N, Names, Nicknames, F):
    # make sure everything is in lowercase in local copies
    original = W
    previous = P
    next = N
    _result = W.lower()
    _original = W.lower()
    if not previous is None:
        _previous = P.lower()
    else:
        _previous = None

    if not next is None:
        _next = N.lower()
    else:
        _next = None

    _notAWordFlag = False
    _contractionFlag = False

    # check for irregular characters
    for symbol in _badSymbols:
        if (_result.find(symbol) > 0):
            _notAWordFlag = True

    if not _notAWordFlag:
        regex = re.compile('[^a-zA-Z0-9\s]')

        # First parameter is the replacement, second parameter is your input string
        _result = regex.sub('', _result)
        _original = regex.sub('', _original)
        if not _previous is None:
            _previous = regex.sub('', _previous)
        if not _next is None:
            _next = regex.sub('', _next)

        ignoreFlag = Contains(_ignore, _original)

        if not ignoreFlag:
            if _result == _original and F == True:
                _result = AnonymizeWord_Flag(_result, F)
                # print(result)

            # for each rule first check to see if the word has already changed,
            # if it is already changed then do not run anymore rules
            #    print(result)
            if _result == _original:
                _result = AnonymizeWord_Pronoun(_result)
            #    print(result)

            if _result == _original:
                if AnonymizeWord_Contraction(original):
                    _result = "CONTRACTION"
                    _contractionFlag = True
                   # print(result)

                if AnonymizeWord_Acronym(original):
                    for name in Names:
                        if not _result == "INITIAL":
                            _name = name.lower();
                            _result = AnonymizeWord_Initials(original, _next, _name, Names[0].lower())

                    if not _result == "INITIAL":
                        _result = "ACRONYM"
                # print(result)

            if _result == _original:
                _result = AnonymizeWord_Adjective(_result)
                # print(result)

            if _result == _original:
                _result = AnonymizeWord_Abbreviations(_result)
                # print(result)

            if _result == _original or _contractionFlag:
                for name in Names:
                    _name = name.lower();
                    if _result == _original and (not _contractionFlag):
                        _result = AnonymizeWord_Name(_result, _name)
                        # if the length of the name is 1 (an initial) than the next word must also be a name
                        if len(_name) == 1:
                            _next = next
                            _prev = previous
                            for name2 in Names:
                                _next = AnonymizeWord_Name(_next, name2)
                                _prev = AnonymizeWord_Name(_prev, name2)
                            if _next != "NAME" and _prev != "NAME":
                                # reset the word back to the original value
                                _result = original

                    # print(result)

                    if _contractionFlag:
                        _temp = _original[:len(_original)-1]
                        if AnonymizeWord_Name(_temp, _name) == "NAME":
                            _result = "NAME"
                            _contractionFlag = False

                    if _result == _original:
                        _result = AnonymizeWord_Initials(_result, _next, _name, Names[0].lower())
                        # print(result)

                    if _result == _original or _contractionFlag:
                        if (not _contractionFlag):
                            _result = AnonymizeWord_NickName(_result, _name, Nicknames)

                        if (_contractionFlag):
                            _temp = _original[:len(_original)-1]
                            if AnonymizeWord_NickName(_temp, _name, Nicknames) == "NICKNAME":
                                _result = "NICKNAME"
                                _contractionFlag = False
                        # print(result)


            """                    if _result == _original:
                                    _result = AnonymizeWord_NameSubword(_result, _previous, _next, _name, Names[0].lower())
                                    # print(result)
            """

            if _result == _original:
                _result = None
        elif ignoreFlag:
            _result = None

        if _result == "ACRONYM":
            _result = None
        elif _result == "CONTRACTION" or _contractionFlag:
            _result = None
    else:
        _result = None

    return _result

"""
Inputs:
    String T: The text to anonymize
    Array[String] Names: The names of the resident and observer
    Array[String] NickNames: A list of known nicknames

Returns:
    String: Returns the anonymized text

SetAnonFlag takes the word and determines if it is a title. If so then the next word should be anonymized. Also, if the word is an initial then the next word should also be anonymized.
"""
def AnonymizeText(T, Names, NickNames):
    _result = []
    _outputTest = ""
    _words = extractWords(T)

    nicknamesWithLowercaseKeys = dict((k.lower(), v) for k, v in NickNames.items())

    #whitespaces = [i for i, char in enumerate(T) if char in whitespace]
    #whitespaces.append(len(T))

    #start = 0
    #end = 0

    #regex = re.compile('[^a-zA-Z0-9\s\']')
    # First parameter is the replacement, second parameter is your input string
    #_text = regex.sub('', T)
    #_words = _text.split()

    prev = None
    _next = None
    _flag = False
    index = 0
    for w in _words:

        #end = whitespaces[index]
        #tmp = T[start:end]
        #print(tmp)

        _label = w.label
        _start = w.start
        _end = w.end
        resultAsDict = {"start":_start,"end":_end,"label":""}

        if index + 1 < len(_words):
            _next = _words[index + 1].label
        else:
            next = None

        _anonWord = AnonymizeWord(_label, prev, _next, Names, nicknamesWithLowercaseKeys, _flag)

        if _anonWord is None:
            output = "None"
            if verbose:
                _outputTest = _outputTest + " " + w.label
        else:
            output = _anonWord
            if verbose:
                _outputTest = _outputTest + " " + output
            resultAsDict["label"] = output
            _result.append(resultAsDict)

        _flag = SetAnonFlag(_label, _flag)

        if verbose:
            print("word = " + w.label + ", result = " + _outputTest + ", flag = " + str(_flag) + ", start = " + str(_start) + ", end = " + str(_end))
        prev = _label
        index = index + 1

    if verbose:
        print("anonymized text = " + _outputTest)
    return _result

"""
Inputs:
    String W: The current word under consideration
    Boolean F: A flag that indicates the previous word was unusual

Returns:
    Boolean: Return an anonymization flag

SetAnonFlag takes the word and determines if it is a title. If so then the next word should be anonymized. Also, if the word is an initial then the next word should also be anonymized.
"""
def SetAnonFlag(W, F):
    _result = False
    processing = W.lower()

    if (processing == "doctor" or
            processing == "dr" or
            processing == "mister" or
            processing == "miss" or
            processing == "mr" or
            processing == "ms" or
            processing == "mrs"):
        _result = True
    elif F is True and len(W) == 1:
        # if the flag is set and
        # the word is one character long (an initial) then flag the next word as well
        _result = True

    return _result

"""    samples = ['Dr. Wilson's. Wilson I am  a fool of a took. apply. STEMI. Stemi.  J Smith. Grayson as discussed Dr. A Henderson think'
               'you need to work on strategies to help you ensure',
               'that you are completing full reassessments including being aware of what results',
               'or tests that you have ordered are still outstanding.    You also would improve by',
               'being more mindful of timing to reassess patients.    Your patient care was very EB',
               'and you are quite good at accessing relevant guidelines and critically thinking',
               'your way through them as they would apply to your particular patient. wasn\'t']
    """

"""
DEPRECATED
With the change to the main interface this test procedure no longer is valid
def Test(R, F):
    _result = R
    _flag = F
    samples = ['Wilson\'s I am  a fool of a took. apply. STEMI. Stemi.  J Smith. Grayson as discussed Dr. A Henderson think']
    for sample in samples:
        regex = re.compile('[^a-zA-Z0-9\s\']')
        # First parameter is the replacement, second parameter is your input string
        sample = regex.sub('', sample)
        words = sample.split()
        names = ['Grayson', 'Wilson', 'Joanna', 'Smith']

        prev = None
        next = None
        index = 0
        for w in words:
            if (index+1 < len(words)):
                next = words[index+1]
            else:
                next = None
            _result = AnonymizeWord(w, prev, next, names, _flag)

            if _result is None:
                output = "None"
            else:
                output = _result
            _flag = SetAnonFlag(w, _flag)

            print("word = " + w + ", result = " + output + ", flag = " + str(_flag))
            prev = w
            index = index + 1


result = ""
flag = False
"""
def Test():
    text = 'Robert of a simism, but Robert A Wilson had a completely stable patient, and approached it like a resus'
    names = ['Robert','A','Wilson']
    nicknames = {"richard":['rick','ricky','richie','dick'],
                 "stewart":['stu'],
                 "samuel":['sam','sammy'],
                 "elizabeth":['elle', 'liz'],
                 "jason":['jay']
                }
    output = AnonymizeText(text,names,nicknames)
    print(output)


def analyzeText(text: str, names: List[str]):
    flag = False

    textSegments = extractWords(text)
    result: List[TextSegment] = []
    textSegmentsLength = len(textSegments)
    for i in range(textSegmentsLength):
        textSegment = textSegments[i]
        previousSegment = textSegments[i - 1] if i > 0 else None
        nextSegment = textSegments[i + 1] if i < textSegmentsLength - 1 else None
        label = AnonymizeWord(
            textSegment.label,
            previousSegment.label if previousSegment else None,
            nextSegment.label if nextSegment else None,
            names,
            flag
        )
        flag = SetAnonFlag(textSegment.label, flag)
        if label is not None:
            textSegment.label = label
            result.append(textSegment)

    return result


def extractWords(text: str):
    words: List[TextSegment] = []
    startIndex: int = None
    currentWord: str = ''
    for i in range(len(text)):
        character = text[i]
        match = re.match('[\w\'/]+', character)
        if match:
            currentWord += character
            if startIndex is None:
                startIndex = i
            if i == len(text) - 1:
                words.append(TextSegment(startIndex, i, currentWord))
                currentWord = ''
                startIndex = None
        elif startIndex is not None:
            words.append(TextSegment(startIndex, i, currentWord))
            currentWord = ''
            startIndex = None
    return words


def serializeList(myList: List[Serializable]):
    return list(map(lambda item: item.serialize(), myList))


# comment this out when the test is not needed
verbose = False
#testing = False
#if testing:
#    Test()